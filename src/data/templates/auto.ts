import type { LegalTemplate } from "../types";

export const TEMPLATES_AUTO: LegalTemplate[] = [
{
    id: "dkp-auto",
    name: "Договор купли-продажи автомобиля (ДКП)",
    category: "auto",
    actSource: "ст. 454 Гражданского кодекса РФ",
    lastUpdated: "Апрель 2026",
    description:
      "Стандартный договор купли-продажи транспортного средства для физических лиц. Составляется в 3-х экземплярах.",
    suggestedDocs: ["act-transfer-auto", "raspiska-money", "gibdd-reg-app", "power-of-attorney-auto"],
    supportsOcr: true,
    printInstruction:
      "Рекомендуется печатать на одном листе А4 с двух сторон",
    fields: [
      {
        id: "city",
        label: "Город составления",
        type: "text",
        defaultValue: "",
        category: "contract",
        validation: { required: true },
      },
      {
        id: "date",
        label: "Дата договора",
        type: "date",
        defaultValue: "",
        category: "contract",
        validation: { required: true },
      },
      {
        id: "copies_count",
        label: "Количество экземпляров",
        type: "select",
        defaultValue: "3",
        category: "contract",
        options: [
          { label: "2 (для продавца и покупателя)", value: "2" },
          {
            label: "3 (продавец, покупатель + ГИБДД)",
            value: "3",
          },
        ],
      },
      {
        id: "seller_fio",
        label: "ФИО Продавца",
        type: "text",
        placeholder: "Иванов Иван Иванович",
        defaultValue: "",
        category: "seller",
        validation: { required: true },
      },
      {
        id: "seller_birthday",
        label: "Дата рождения продавца",
        type: "date",
        defaultValue: "",
        category: "seller",
      },
      {
        id: "seller_passport_series",
        label: "Паспорт (Серия)",
        type: "text",
        placeholder: "4512",
        defaultValue: "",
        category: "seller",
        validation: { minLength: 4, maxLength: 4 },
      },
      {
        id: "seller_passport_number",
        label: "Паспорт (Номер)",
        type: "text",
        placeholder: "123456",
        defaultValue: "",
        category: "seller",
        validation: { minLength: 6, maxLength: 6 },
      },
      {
        id: "seller_passport_issued_by",
        label: "Кем выдан паспорт",
        type: "text",
        defaultValue: "",
        category: "seller",
      },
      {
        id: "seller_passport_code",
        label: "Код подразделения",
        type: "text",
        placeholder: "770-001",
        defaultValue: "",
        category: "seller",
      },
      {
        id: "seller_address",
        label: "Адрес регистрации продавца",
        type: "text",
        defaultValue: "",
        category: "seller",
        validation: { required: true },
      },
      {
        id: "seller_living_address_same",
        label: "Адрес проживания совпадает с адресом регистрации",
        type: "checkbox",
        defaultValue: "true",
        category: "seller",
      },
      {
        id: "seller_living_address",
        label: "Адрес проживания продавца",
        type: "text",
        defaultValue: "",
        category: "seller",
        dependsOn: {
          fieldId: "seller_living_address_same",
          value: "false",
        },
      },
      {
        id: "seller_phone",
        label: "Телефон продавца",
        type: "text",
        defaultValue: "",
        category: "seller",
      },
      {
        id: "buyer_fio",
        label: "ФИО Покупателя",
        type: "text",
        placeholder: "Петров Петр Петрович",
        defaultValue: "",
        category: "buyer",
        validation: { required: true },
      },
      {
        id: "buyer_birthday",
        label: "Дата рождения покупателя",
        type: "date",
        defaultValue: "",
        category: "buyer",
      },
      {
        id: "buyer_passport_series",
        label: "Паспорт (Серия)",
        type: "text",
        placeholder: "4615",
        defaultValue: "",
        category: "buyer",
        validation: { minLength: 4, maxLength: 4 },
      },
      {
        id: "buyer_passport_number",
        label: "Паспорт (Номер)",
        type: "text",
        placeholder: "987654",
        defaultValue: "",
        category: "buyer",
        validation: { minLength: 6, maxLength: 6 },
      },
      {
        id: "buyer_passport_issued_by",
        label: "Кем выдан паспорт",
        type: "text",
        defaultValue: "",
        category: "buyer",
      },
      {
        id: "buyer_passport_code",
        label: "Код подразделения",
        type: "text",
        placeholder: "500-022",
        defaultValue: "",
        category: "buyer",
      },
      {
        id: "buyer_address",
        label: "Адрес регистрации покупателя",
        type: "text",
        defaultValue: "",
        category: "buyer",
        validation: { required: true },
      },
      {
        id: "buyer_phone",
        label: "Телефон покупателя",
        type: "text",
        defaultValue: "",
        category: "buyer",
      },
      {
        id: "car_brand",
        label: "Марка и модель ТС",
        type: "text",
        placeholder: "Kia Rio",
        defaultValue: "",
        category: "vehicle",
        validation: { required: true },
      },
      {
        id: "car_year",
        label: "Год выпуска ТС",
        type: "number",
        defaultValue: "",
        category: "vehicle",
        validation: { required: true },
      },
      {
        id: "car_color",
        label: "Цвет ТС",
        type: "text",
        defaultValue: "",
        category: "vehicle",
        suggestions: [
          "белый",
          "чёрный",
          "серый",
          "тёмно-серый",
          "светло-серый",
          "серебристый",
          "синий",
          "тёмно-синий",
          "светло-синий",
          "голубой",
          "тёмно-голубой",
          "светло-голубой",
          "красный",
          "тёмно-красный",
          "светло-красный",
          "бордовый",
          "тёмно-бордовый",
          "светло-бордовый",
          "вишнёвый",
          "тёмно-вишнёвый",
          "светло-вишнёвый",
          "оранжевый",
          "тёмно-оранжевый",
          "светло-оранжевый",
          "жёлтый",
          "тёмно-жёлтый",
          "светло-жёлтый",
          "зелёный",
          "тёмно-зелёный",
          "светло-зелёный",
          "коричневый",
          "тёмно-коричневый",
          "светло-коричневый",
          "бежевый",
          "тёмно-бежевый",
          "светло-бежевый",
          "золотистый",
          "тёмно-золотистый",
          "светло-золотистый",
          "фиолетовый",
          "тёмно-фиолетовый",
          "светло-фиолетовый",
          "пурпурный",
          "тёмно-пурпурный",
          "светло-пурпурный",
          "розовый",
          "тёмно-розовый",
          "светло-розовый",
          "хаки",
          "тёмно-хаки",
          "светло-хаки",
        ],
      },
      {
        id: "car_vin",
        label: "VIN номер ТС",
        type: "text",
        placeholder: "17 символов",
        defaultValue: "",
        category: "vehicle",
        validation: { minLength: 17, maxLength: 17, required: true },
      },
      {
        id: "car_engine",
        label: "Номер двигателя",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_chassis",
        label: "Номер шасси/рамы",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_plate",
        label: "Гос. регистрационный знак",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_pts_type",
        label: "Тип паспорта ТС",
        type: "radio",
        defaultValue: "ПТС",
        category: "vehicle",
        options: [
          { label: "ПТС (бумажный)", value: "ПТС" },
          { label: "ЭПТС (электронный)", value: "ЭПТС" },
        ],
      },
      {
        id: "car_pts",
        label: "Паспорт ТС (ПТС)",
        type: "text",
        defaultValue: "",
        category: "vehicle",
        dependsOn: { fieldId: "car_pts_type", value: "ПТС" },
      },
      {
        id: "car_epts",
        label: "Номер ЭПТС",
        type: "text",
        defaultValue: "",
        category: "vehicle",
        dependsOn: { fieldId: "car_pts_type", value: "ЭПТС" },
      },
      {
        id: "car_sts",
        label: "Свидетельство о регистрации (СТС)",
        type: "text",
        defaultValue: "",
        category: "vehicle",
        validation: { required: true },
      },
      {
        id: "contract_price",
        label: "Стоимость ТС (суммой)",
        type: "number",
        defaultValue: "",
        category: "contract",
        validation: { required: true },
      },
      {
        id: "contract_price_words",
        label: "Стоимость прописью",
        type: "text",
        defaultValue: "",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[20mm] pr-[15mm] pt-[20mm] pb-[20mm] font-serif text-base leading-normal text-zinc-900 bg-white">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="doc-title text-center font-bold text-base uppercase mb-2">Договор купли-продажи транспортного средства</div>
  <div class="text-center text-xs mb-6">№ {{{car_plate}}}</div>
  <div class="border-b border-zinc-300 mb-6"></div>

  <div class="doc-sides grid grid-cols-2 gap-6 mb-6">
    <div>
      <div class="doc-sides-title">Продавец</div>
      <p class="mb-1 text-sm"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-xs mb-0.5">Паспорт: {{{seller_passport_series}}} {{{seller_passport_number}}}</p>
      <p class="text-xs mb-0.5">Выдан: {{{seller_passport_issued_by}}} {{{seller_passport_code}}}</p>
      <p class="text-xs mb-0.5">Зарегистрирован: {{{seller_address}}}</p>
      <p class="text-xs mb-0.5">Телефон: {{{seller_phone}}}</p>
    </div>
    <div>
      <div class="doc-sides-title">Покупатель</div>
      <p class="mb-1 text-sm"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-xs mb-0.5">Паспорт: {{{buyer_passport_series}}} {{{buyer_passport_number}}}</p>
      <p class="text-xs mb-0.5">Выдан: {{{buyer_passport_issued_by}}} {{{buyer_passport_code}}}</p>
      <p class="text-xs mb-0.5">Зарегистрирован: {{{buyer_address}}}</p>
      <p class="text-xs mb-0.5">Телефон: {{{buyer_phone}}}</p>
    </div>
  </div>

  <p class="mb-4 text-justify">
    Продавец передает в собственность Покупателю, а Покупатель принимает и оплачивает транспортное средство:
  </p>

  <table class="w-full border-collapse mb-4 text-xs">
    <tr><th class="border border-zinc-400 p-1 text-left">Марка, модель</th><td class="border border-zinc-400 p-1">{{{car_brand}}}</td></tr>
    <tr><th class="border border-zinc-400 p-1 text-left">Год выпуска</th><td class="border border-zinc-400 p-1">{{{car_year}}}</td></tr>
    <tr><th class="border border-zinc-400 p-1 text-left">Идентификационный номер (VIN)</th><td class="border border-zinc-400 p-1">{{{car_vin}}}</td></tr>
    <tr><th class="border border-zinc-400 p-1 text-left">Государственный регистрационный знак</th><td class="border border-zinc-400 p-1">{{{car_plate}}}</td></tr>
    <tr><th class="border border-zinc-400 p-1 text-left">Цвет</th><td class="border border-zinc-400 p-1">{{{car_color}}}</td></tr>
    <tr><th class="border border-zinc-400 p-1 text-left">Двигатель №</th><td class="border border-zinc-400 p-1">{{{car_engine}}}</td></tr>
    <tr><th class="border border-zinc-400 p-1 text-left">Шасси (рама) №</th><td class="border border-zinc-400 p-1">{{{car_chassis}}}</td></tr>
    {{#car_pts}}<tr><th class="border border-zinc-400 p-1 text-left">Паспорт ТС (ПТС)</th><td class="border border-zinc-400 p-1">{{{car_pts}}}</td></tr>{{/car_pts}}
    {{#car_epts}}<tr><th class="border border-zinc-400 p-1 text-left">Электронный паспорт ТС (ЭПТС)</th><td class="border border-zinc-400 p-1">{{{car_epts}}}</td></tr>{{/car_epts}}
    <tr><th class="border border-zinc-400 p-1 text-left">Свидетельство о регистрации (СТС)</th><td class="border border-zinc-400 p-1">{{{car_sts}}}</td></tr>
  </table>

  <div class="doc-price mb-4">
    <p class="text-sm">Цена договора: <strong>{{{contract_price}}} рублей</strong></p>
    <p class="text-xs text-zinc-600">(прописью: <em>{{{contract_price_words}}}</em>)</p>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец гарантирует, что на момент заключения настоящего Договора Транспортное средство не находится в залоге, под арестом, не состоит под запретом на регистрационные действия в органах ГИБДД, не обременено правами третьих лиц.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Условия оплаты и цена договора</div>
  <p class="mb-4 text-justify">
    2.1. Стороны договорились, что стоимость Транспортного средства составляет сумму, указанную в п. «Цена договора».
  </p>
  <p class="mb-4 text-justify">
    2.2. Покупатель обязуется передать указанную сумму в качестве оплаты за Транспортное средство Продавцу непосредственно при подписании настоящего договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача транспортного средства</div>
  <p class="mb-4 text-justify">
    3.1. Передача ТС осуществляется по соответствующему Акту приема-передачи ТС, являющемуся неотъемлемой частью Договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Реквизиты и подписи сторон</div>
  <p class="mb-4 text-justify">
    4.1. Настоящий договор составлен в {{{copies_count}}} экземплярах, имеющих равную юридическую силу, по одному для каждой из сторон.
  </p>

  <div class="grid grid-cols-2 gap-6 mt-6 text-xs">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport_series}}} {{{seller_passport_number}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_address}}}</p>
      <p class="text-zinc-500 text-[11px]">Телефон: {{{seller_phone}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись Продавца</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport_series}}} {{{buyer_passport_number}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_address}}}</p>
      <p class="text-zinc-500 text-[11px]">Телефон: {{{buyer_phone}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись Покупателя</div>
    </div>
  </div>
</div>`,
  },
{
    id: "act-transfer-auto",
    name: "Акт приема-передачи транспортного средства",
    category: "auto",
    actSource: "Приложение к договору купли-продажи ТС",
    lastUpdated: "Январь 2026",
    description:
      "Акт подтверждает фактическую передачу автомобиля от продавца покупателю, а также отсутствие взаимных претензий.",
    suggestedDocs: ["dkp-auto", "raspiska-money"],
    supportsOcr: true,
    printInstruction:
      "Рекомендуется печатать на одном листе А4 с двух сторон",
    fields: [
      {
        id: "city",
        label: "Город составления",
        type: "text",
        defaultValue: "",
        category: "contract",
      },
      {
        id: "date",
        label: "Дата акта",
        type: "date",
        defaultValue: "",
        category: "contract",
      },
      {
        id: "dkp_date",
        label: "Дата ДКП автомобиля",
        type: "date",
        defaultValue: "",
        category: "contract",
      },
      {
        id: "seller_fio",
        label: "ФИО Продавца",
        type: "text",
        defaultValue: "",
        category: "seller",
      },
      {
        id: "buyer_fio",
        label: "ФИО Покупателя",
        type: "text",
        defaultValue: "",
        category: "buyer",
      },
      {
        id: "car_brand",
        label: "Марка и модель ТС",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_year",
        label: "Год выпуска ТС",
        type: "number",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_vin",
        label: "VIN номер ТС",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_plate",
        label: "Гос. знак ТС",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_keys_qty",
        label: "Количество ключей",
        type: "number",
        defaultValue: "",
        category: "vehicle",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Акт приема-передачи транспортного средства</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Настоящий акт составлен сторонами о том, что Продавец <strong>{{{seller_fio}}}</strong> фактически передал в собственность Покупателю <strong>{{{buyer_fio}}}</strong> транспортное средство <strong>{{{car_brand}}}</strong>, год выпуска: {{{car_year}}}, VIN: {{{car_vin}}}, гос. номер: {{{car_plate}}}, в соответствии с условиями Договора купли-продажи от «{{{dkp_date}}}»
  </p>
  <p class="mb-4 text-justify">
    Вместе с автомобилем Продавец передал Покупателю комплект ключей зажигания в количестве <strong>{{{car_keys_qty}}} шт.</strong>
  </p>
  <p class="mb-4 text-justify">
    Покупатель подтверждает, что указанное транспортное средство осмотрено, его техническое состояние и комплектность полностью соответствуют договоренностям сторон.
  </p>
  <div class="grid grid-cols-2 gap-6 mt-12 text-xs border-t border-zinc-300 pt-4">
    <div><div class="font-bold mb-1">Сдал Продавец:</div><p class="mb-6"><strong>{{{seller_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5"></div></div>
    <div><div class="font-bold mb-1">Принял Покупатель:</div><p class="mb-6"><strong>{{{buyer_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5"></div></div>
  </div>
</div>`,
  },
{
    id: "gibdd-reg-app",
    name: "Заявление на регистрацию ТС в ГИБДД",
    category: "auto",
    actSource: "Приказ МВД России № 950",
    lastUpdated: "Август 2026",
    description:
      "Официальный бланк заявления для подачи в ГИБДД (МРЭО) на постановку автомобиля на учёт, внесение изменений или прекращение регистрации.",
    suggestedDocs: ["dkp-auto", "act-transfer-auto"],
    supportsOcr: true,
    printInstruction:
      "Печатайте на одном листе А4 с двух сторон!",
    fields: [
      {
        id: "date",
        label: "Дата заполнения",
        type: "date",
        defaultValue: "",
        category: "contract",
        validation: { required: true },
      },
      {
        id: "gibdd_version",
        label: "Версия бланка",
        type: "select",
        defaultValue: "2026",
        category: "contract",
        obsoleteValues: ["2024", "2023", "2019"],
        options: [
          { label: "Действующая (2026+)", value: "2026" },
          { label: "Старая (до 02.08.2026)", value: "2024" },
          { label: "Старая (до 07.02.2024)", value: "2023" },
          { label: "Старая (до 31.12.2019)", value: "2019" },
        ],
      },
      {
        id: "gibdd_department",
        label: "Наименование подразделения ГИБДД",
        type: "text",
        defaultValue: "",
        category: "contract",
        validation: { required: true },
      },
      {
        id: "applicant_fio",
        label: "ФИО заявителя",
        type: "text",
        defaultValue: "",
        category: "owner",
        validation: { required: true },
      },
      {
        id: "action_sts",
        label: "Действия со СТС",
        type: "radio",
        defaultValue: "с выдачей СТС",
        category: "sts",
        options: [
          { label: "С выдачей СТС", value: "с выдачей СТС" },
          { label: "Без выдачи СТС", value: "без выдачи СТС" },
        ],
      },
      {
        id: "action_pts",
        label: "Действия с ПТС",
        type: "radio",
        defaultValue: "без выдачи ПТС",
        category: "pts",
        options: [
          {
            label: "С выдачей ПТС (если утерян или нет места)",
            value: "с выдачей ПТС",
          },
          { label: "Без выдачи ПТС", value: "без выдачи ПТС" },
        ],
      },
      {
        id: "action_grz",
        label: "Действия с ГРЗ",
        type: "radio",
        defaultValue: "с выдачей ГРЗ",
        category: "grz",
        options: [
          { label: "С выдачей ГРЗ", value: "с выдачей ГРЗ" },
          { label: "Без выдачи ГРЗ", value: "без выдачи ГРЗ" },
          {
            label: "С присвоением сохранённого ГРЗ",
            value: "с присвоением сохранённого ГРЗ",
          },
          {
            label: "С сохранением и выдачей ГРЗ",
            value: "с сохранением и выдачей ГРЗ",
          },
        ],
      },
      {
        id: "reason",
        label: "Причина обращения",
        type: "select",
        defaultValue: "Внести изменения в связи с изменением собственника (владельца)",
        category: "contract",
        validation: { required: true },
        options: [
          {
            label: "Зарегистрировать новое, приобретенное в РФ",
            value: "Зарегистрировать новое, приобретенное в Российской Федерации",
          },
          {
            label: "Зарегистрировать ввезённое в РФ",
            value: "Зарегистрировать ввезенное в Российскую Федерацию",
          },
          {
            label: "Зарегистрировать приобретенное в качестве высвобождаемого военного имущества",
            value: "Зарегистрировать приобретенное в качестве высвобождаемого военного имущества",
          },
          {
            label: "Зарегистрировать изготовленное в РФ",
            value: "Зарегистрировать изготовленное в Российской Федерации",
          },
          {
            label: "Зарегистрировать временно ввезённое в РФ на срок более 6 месяцев",
            value: "Зарегистрировать временно ввезенное в Российскую Федерацию на срок более 6 месяцев",
          },
          {
            label: "Внести изменения в связи с изменением собственника (владельца)",
            value: "Внести изменения в связи с изменением собственника (владельца)",
          },
          {
            label: "Внести изменения в связи с изменением данных о собственнике (владельце)",
            value: "Внести изменения в связи с изменением данных о собственнике (владельце)",
          },
          {
            label: "Внести изменения в связи с заменой либо получением ГРЗ взамен утраченных",
            value: "Внести изменения в связи с заменой либо получением регистрационных знаков взамен утраченных или пришедших в негодность",
          },
          {
            label: "Внести изменения в связи с получением СТС и (или) ПТС взамен утраченных",
            value: "Внести изменения в связи с получением свидетельства о регистрации ТС и (или) ПТС взамен утраченных или пришедших в негодность",
          },
          {
            label: "Внести изменения в регистрационные данные, не связанные с изменением конструкции",
            value: "Внести изменения в связи с изменениями регистрационных данных, не связанных с изменением конструкции",
          },
          {
            label: "Внести изменения в связи с изменением конструкции",
            value: "Внести изменения в связи с изменением конструкции",
          },
          {
            label: "Снять с учёта в связи с вывозом за пределы РФ",
            value: "Снять с учета в связи с вывозом его за пределы территории Российской Федерации и (или) окончанием срока регистрации на ограниченный срок",
          },
          {
            label: "Снять с учёта в связи с дальнейшей утилизацией",
            value: "Снять с учета в связи с дальнейшей утилизацией",
          },
          {
            label: "Прекратить регистрацию в связи с утратой ТС",
            value: "Прекратить регистрацию в связи с утратой (неизвестно место нахождения транспортного средства или при невозможности пользоваться транспортным средством)",
          },
          {
            label: "Прекратить регистрацию в связи с хищением",
            value: "Прекратить регистрацию в связи с хищением",
          },
          {
            label: "Прекратить регистрацию в связи с продажей (передачей) другому лицу",
            value: "Прекратить регистрацию в связи с продажей (передачей) другому лицу",
          },
        ],
      },
      {
        id: "car_plate",
        label: "Государственный регистрационный знак",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_vin",
        label: "Идентификационный номер (VIN)",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_make",
        label: "Марка, модель ТС",
        type: "text",
        defaultValue: "",
        category: "vehicle",
        validation: { required: true },
      },
      {
        id: "car_type",
        label: "Тип ТС",
        type: "text",
        defaultValue: "",
        category: "vehicle",
        suggestions: [
          "легковой",
          "грузовой",
          "автобус",
          "микроавтобус",
          "мотоцикл",
          "мопед",
          "мотороллер",
          "квадроцикл",
          "прицеп",
          "полуприцеп",
          "фургон",
          "самосвал",
          "седельный тягач",
          "специальный",
          "специализированный",
          "снегоход",
        ],
      },
      {
        id: "car_category",
        label: "Категория ТС",
        type: "select",
        defaultValue: "B",
        category: "vehicle",
        options: [
          { label: "A", value: "A" },
          { label: "B", value: "B" },
          { label: "C", value: "C" },
          { label: "D", value: "D" },
          { label: "E", value: "E" },
          { label: "M", value: "M" },
          { label: "BE", value: "BE" },
          { label: "CE", value: "CE" },
          { label: "DE", value: "DE" },
        ],
      },
      {
        id: "car_color",
        label: "Цвет кузова",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_year",
        label: "Год выпуска",
        type: "number",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_chassis",
        label: "Номер шасси (рамы)",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_body",
        label: "Номер кузова (кабины, прицепа)",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_engine_model",
        label: "Модель двигателя",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_engine_number",
        label: "Номер двигателя",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_steering",
        label: "Рулевое расположение",
        type: "select",
        defaultValue: "левое",
        category: "vehicle",
        options: [
          { label: "Левое", value: "левое" },
          { label: "Правое", value: "правое" },
          { label: "Центральное", value: "центральное" },
          { label: "Отсутствует", value: "отсутствует" },
        ],
      },
      {
        id: "car_drive",
        label: "Тип привода",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_engine_type",
        label: "Тип двигателя",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_transmission",
        label: "Тип трансмиссии",
        type: "text",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_power_kw",
        label: "Мощность двигателя, кВт",
        type: "number",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_power_hp",
        label: "Мощность двигателя, л.с.",
        type: "number",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_mass_max",
        label: "Разрешённая максимальная масса, кг",
        type: "number",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_mass_empty",
        label: "Масса без нагрузки, кг",
        type: "number",
        defaultValue: "",
        category: "vehicle",
      },
      {
        id: "pts_type",
        label: "Вид паспорта ТС",
        type: "radio",
        defaultValue: "ЭПТС",
        category: "pts",
        options: [
          { label: "ПТС (бумажный)", value: "ПТС" },
          { label: "ЭПТС (электронный)", value: "ЭПТС" },
        ],
      },
      {
        id: "pts_series",
        label: "Серия ПТС",
        type: "text",
        defaultValue: "",
        category: "pts",
      },
      {
        id: "pts_number",
        label: "Номер ПТС",
        type: "text",
        defaultValue: "",
        category: "pts",
      },
      {
        id: "pts_date",
        label: "Дата выдачи ПТС",
        type: "date",
        defaultValue: "",
        category: "pts",
      },
      {
        id: "pts_issued_by",
        label: "Кем выдан ПТС",
        type: "text",
        defaultValue: "",
        category: "pts",
      },
      {
        id: "epts_number",
        label: "Номер ЭПТС",
        type: "text",
        defaultValue: "",
        category: "pts",
      },
      {
        id: "car_sts",
        label: "СТС (серия, номер)",
        type: "text",
        defaultValue: "",
        category: "sts",
      },
      {
        id: "car_eco_class",
        label: "Экологический класс",
        type: "select",
        defaultValue: "5",
        category: "vehicle",
        options: [
          { label: "Не установлен", value: "Не установлен" },
          { label: "4", value: "4" },
          { label: "5", value: "5" },
          { label: "6", value: "6" },
        ],
      },
      {
        id: "ownership_doc_name",
        label: "Документ о праве собственности: название",
        type: "text",
        defaultValue: "",
        category: "contract",
      },
      {
        id: "ownership_doc_number",
        label: "Документ о праве собственности: №",
        type: "text",
        defaultValue: "",
        category: "contract",
      },
      {
        id: "ownership_doc_date",
        label: "Документ о праве собственности: дата",
        type: "date",
        defaultValue: "",
        category: "contract",
      },
      {
        id: "osago_number",
        label: "Полис ОСАГО: №",
        type: "text",
        defaultValue: "",
        category: "insurance",
      },
      {
        id: "osago_date",
        label: "Полис ОСАГО: дата",
        type: "date",
        defaultValue: "",
        category: "insurance",
      },
      {
        id: "osago_issued_by",
        label: "Полис ОСАГО: кем выдан",
        type: "text",
        defaultValue: "",
        category: "insurance",
      },
      {
        id: "other_docs",
        label: "Иные документы (по необходимости)",
        type: "textarea",
        defaultValue: "",
        category: "contract",
      },
      {
        id: "owner_birth_date",
        label: "Дата рождения",
        type: "date",
        defaultValue: "",
        category: "owner",
      },
      {
        id: "owner_birth_place",
        label: "Место рождения",
        type: "text",
        defaultValue: "",
        category: "owner",
      },
      {
        id: "owner_passport_series",
        label: "Паспорт: серия",
        type: "text",
        defaultValue: "",
        category: "owner",
        validation: { required: true },
      },
      {
        id: "owner_passport_number",
        label: "Паспорт: номер",
        type: "text",
        defaultValue: "",
        category: "owner",
        validation: { required: true },
      },
      {
        id: "owner_passport_date",
        label: "Паспорт: дата выдачи",
        type: "date",
        defaultValue: "",
        category: "owner",
      },
      {
        id: "owner_passport_by",
        label: "Паспорт: кем выдан",
        type: "text",
        defaultValue: "",
        category: "owner",
      },
      {
        id: "owner_passport_code",
        label: "Паспорт: код подразделения",
        type: "text",
        defaultValue: "",
        category: "owner",
      },
      {
        id: "owner_citizenship",
        label: "Гражданство",
        type: "text",
        defaultValue: "",
        category: "owner",
      },
      {
        id: "owner_gender",
        label: "Пол",
        type: "radio",
        defaultValue: "Мужской",
        category: "owner",
        options: [
          { label: "Мужской", value: "Мужской" },
          { label: "Женский", value: "Женский" },
        ],
      },
      {
        id: "owner_address",
        label: "Адрес регистрации по месту жительства",
        type: "textarea",
        defaultValue: "",
        category: "owner",
        validation: { required: true },
      },
      {
        id: "owner_inn",
        label: "ИНН",
        type: "text",
        defaultValue: "",
        category: "owner",
      },
      {
        id: "owner_snils",
        label: "СНИЛС",
        type: "text",
        defaultValue: "",
        category: "owner",
      },
      {
        id: "owner_phone",
        label: "Телефон",
        type: "text",
        defaultValue: "",
        category: "owner",
        validation: { required: true },
      },
      {
        id: "owner_email",
        label: "E-mail",
        type: "text",
        defaultValue: "",
        category: "owner",
      },
      {
        id: "representative_fio",
        label: "Представитель: ФИО",
        type: "text",
        defaultValue: "",
        category: "representative",
      },
      {
        id: "representative_birth_date",
        label: "Представитель: дата рождения",
        type: "date",
        defaultValue: "",
        category: "representative",
      },
      {
        id: "representative_doc",
        label: "Представитель: документ, удостоверяющий личность",
        type: "text",
        defaultValue: "",
        category: "representative",
      },
      {
        id: "representative_address",
        label: "Представитель: адрес",
        type: "textarea",
        defaultValue: "",
        category: "representative",
      },
      {
        id: "representative_phone",
        label: "Представитель: телефон",
        type: "text",
        defaultValue: "",
        category: "representative",
      },
      {
        id: "representative_power",
        label: "Представитель: доверенность (когда, кем выдана, №)",
        type: "text",
        defaultValue: "",
        category: "representative",
      },
      {
        id: "signature_confirm",
        label: "Подтверждение достоверности сведений",
        type: "radio",
        defaultValue: "Подтверждаю",
        category: "owner",
        options: [
          { label: "Подтверждаю", value: "Подтверждаю" },
          { label: "Не подтверждаю", value: "Не подтверждаю" },
        ],
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-3">ЗАЯВЛЕНИЕ</div>
  <table class="w-full border-collapse mb-2 text-xs">
    <tr>
      <td class="border border-zinc-950 p-1 align-top w-1/2">
        <p>В Госавтоинспекцию</p>
        <p class="mt-1 font-semibold">{{gibdd_department}}</p>
        <p class="text-zinc-500">(наименование регистрационного подразделения)</p>
      </td>
      <td class="border border-zinc-950 p-1 align-top w-1/2">
        <p>Я,</p>
        <p class="mt-1 font-semibold">{{applicant_fio}}</p>
        <p class="text-zinc-500">(фамилия, имя, отчество (при наличии) заявителя)</p>
      </td>
    </tr>
  </table>
  <p class="text-xs mb-2">
    представляя нижеследующие документы, прошу:
    <span class="font-semibold">СТС — {{action_sts}}; ПТС — {{action_pts}}; ГРЗ — {{action_grz}}</span>
    <span class="text-zinc-500"> (с выдачей/без выдачи ПТС, ГРЗ/с присвоением сохраненного ГРЗ — в предусмотренных случаях)</span>
  </p>
  <p class="text-xs mb-2">Причина обращения: <span class="font-semibold">{{reason}}</span></p>

  <p class="font-bold text-xs my-2">СВЕДЕНИЯ О ВЛАДЕЛЬЦЕ ТРАНСПОРТНОГО СРЕДСТВА</p>
  <table class="w-full border-collapse mb-2 text-xs">
    <tr>
      <td class="border border-zinc-950 p-1 w-1/3 align-top">Фамилия, имя, отчество (при наличии)</td>
      <td class="border border-zinc-950 p-1 align-top font-semibold">{{applicant_fio}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Дата и место рождения</td>
      <td class="border border-zinc-950 p-1 align-top">{{owner_birth_date}}, {{owner_birth_place}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Документ, удостоверяющий личность</td>
      <td class="border border-zinc-950 p-1 align-top">паспорт {{owner_passport_series}} {{owner_passport_number}}, выдан {{owner_passport_date}} {{owner_passport_by}}, код подразделения {{owner_passport_code}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Адрес места жительства</td>
      <td class="border border-zinc-950 p-1 align-top">{{owner_address}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Телефон / e-mail</td>
      <td class="border border-zinc-950 p-1 align-top">{{owner_phone}} / {{owner_email}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Гражданство / пол</td>
      <td class="border border-zinc-950 p-1 align-top">{{owner_citizenship}} / {{owner_gender}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">ИНН (при наличии) / СНИЛС</td>
      <td class="border border-zinc-950 p-1 align-top">{{owner_inn}} / {{owner_snils}}</td>
    </tr>
  </table>

  <p class="font-bold text-xs my-2">ПРЕДСТАВИТЕЛЬ ВЛАДЕЛЬЦА ТРАНСПОРТНОГО СРЕДСТВА *</p>
  <table class="w-full border-collapse mb-2 text-xs">
    <tr>
      <td class="border border-zinc-950 p-1 w-1/3 align-top">Фамилия, имя, отчество (при наличии)</td>
      <td class="border border-zinc-950 p-1 align-top">{{representative_fio}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Дата рождения</td>
      <td class="border border-zinc-950 p-1 align-top">{{representative_birth_date}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Документ, удостоверяющий личность</td>
      <td class="border border-zinc-950 p-1 align-top">{{representative_doc}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Адрес места жительства</td>
      <td class="border border-zinc-950 p-1 align-top">{{representative_address}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Номер телефона</td>
      <td class="border border-zinc-950 p-1 align-top">{{representative_phone}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Доверенность</td>
      <td class="border border-zinc-950 p-1 align-top">{{representative_power}}</td>
    </tr>
  </table>
  <p class="text-zinc-500 text-[10px] mb-2">* Заполняется в случае, если заявитель не является владельцем транспортного средства.</p>

  <p class="text-xs mb-2">Достоверность сведений подтверждаю: {{signature_confirm}}</p>
  <div class="flex justify-between text-xs">
    <span>«______» _________________ 20____ г.</span>
    <span>Подпись заявителя ___________________ ({{applicant_fio}})</span>
  </div>

  <p class="font-bold text-xs my-3">СВЕДЕНИЯ О ТРАНСПОРТНОМ СРЕДСТВЕ</p>
  <table class="w-full border-collapse mb-2 text-xs">
    <tr>
      <td class="border border-zinc-950 p-1 w-1/2 align-top">Гос. рег. знак: <b>{{car_plate}}</b></td>
      <td class="border border-zinc-950 p-1 w-1/2 align-top">Кузов (кабина, прицеп) №: {{car_body}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Идентификационный номер (VIN): <b>{{car_vin}}</b></td>
      <td class="border border-zinc-950 p-1 align-top">Тип привода: {{car_drive}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Марка, модель: <b>{{car_make}}</b></td>
      <td class="border border-zinc-950 p-1 align-top">Тип двигателя: {{car_engine_type}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Тип ТС: {{car_type}}</td>
      <td class="border border-zinc-950 p-1 align-top">Тип трансмиссии: {{car_transmission}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Цвет: {{car_color}}</td>
      <td class="border border-zinc-950 p-1 align-top">Тех. допустимая макс. масса, кг: {{car_mass_max}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Категория (A, B, C, D, прицеп — E): {{car_category}}</td>
      <td class="border border-zinc-950 p-1 align-top">Масса в снаряж. состоянии, кг: {{car_mass_empty}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Год выпуска: {{car_year}}</td>
      <td class="border border-zinc-950 p-1 align-top">Паспорт ТС (серия, номер, дата выдачи): {{pts_series}} {{pts_number}}, {{pts_date}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Шасси (рама) №: {{car_chassis}}</td>
      <td class="border border-zinc-950 p-1 align-top">Регистрационный документ ТС (СТС): {{car_sts}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Рулевое расположение: {{car_steering}}</td>
      <td class="border border-zinc-950 p-1 align-top">Экологический класс: {{car_eco_class}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Модель двигателя: {{car_engine_model}}</td>
      <td class="border border-zinc-950 p-1 align-top">Мощность двигателя: {{car_power_hp}} л.с. / {{car_power_kw}} кВт</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Двигатель №: {{car_engine_number}}</td>
      <td class="border border-zinc-950 p-1 align-top">Вид паспорта ТС: {{pts_type}}, № ЭПТС: {{epts_number}}</td>
    </tr>
  </table>

  <table class="w-full border-collapse mb-2 text-xs">
    <tr>
      <td class="border border-zinc-950 p-1 w-1/3 align-top">Документ, удостоверяющий право собственности</td>
      <td class="border border-zinc-950 p-1 align-top">{{ownership_doc_name}} № {{ownership_doc_number}} от {{ownership_doc_date}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Страховой полис</td>
      <td class="border border-zinc-950 p-1 align-top">№ {{osago_number}} от {{osago_date}}, выдан {{osago_issued_by}}</td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">Иные документы</td>
      <td class="border border-zinc-950 p-1 align-top">{{other_docs}}</td>
    </tr>
  </table>

  <p class="font-bold text-xs my-3">СЛУЖЕБНЫЕ ОТМЕТКИ</p>
  <table class="w-full border-collapse mb-1 text-xs">
    <tr>
      <td class="border border-zinc-950 p-1 w-1/2 align-top">
        <p class="font-semibold">ПРИНЯТЫ ОТ ЗАЯВИТЕЛЯ</p>
        <p>рег. знаки, ПТС (серия, №), документ о праве собственности, страховой полис (№, когда и кем выдан), иные документы, квитанция № (при наличии)</p>
      </td>
      <td class="border border-zinc-950 p-1 w-1/2 align-top">
        <p class="font-semibold">ПРИСВОЕНЫ ЗАЯВИТЕЛЮ</p>
        <p>свидетельство о регистрации (серия, №), гос. рег. знаки, «ТРАНЗИТ», ПТС (серия, №), иные документы</p>
      </td>
    </tr>
    <tr>
      <td class="border border-zinc-950 p-1 align-top">«______» _________________ 20____ г., подпись, Ф.И.О., должность сотрудника</td>
      <td class="border border-zinc-950 p-1 align-top">подпись заявителя в получении</td>
    </tr>
  </table>
  <p class="text-[10px] text-zinc-500 mt-1">Печатайте на одном листе А4 с двух сторон!</p>
</div>`,
  },
{
    id: "rental-auto",
    name: "Договор аренды автомобиля",
    category: "auto",
    actSource: "ст. 632 ГК РФ",
    lastUpdated: "Июнь 2026",
    description:
      "Договор проката (аренды) транспортного средства между физическими лицами без экипажа.",
    suggestedDocs: ["dkp-auto"],
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
        id: "owner_fio", label: "ФИО Арендодателя (владельца)", type: "text", defaultValue: "",
        category: "owner", validation: { required: true },
      },
      {
        id: "owner_passport", label: "Паспорт арендодателя", type: "text",
        defaultValue: "", category: "owner",
      },
      {
        id: "tenant_fio", label: "ФИО Арендатора", type: "text", defaultValue: "",
        category: "tenant", validation: { required: true },
      },
      {
        id: "tenant_passport", label: "Паспорт арендатора", type: "text",
        defaultValue: "", category: "tenant",
      },
      {
        id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "",
        category: "vehicle", validation: { required: true },
      },
      {
        id: "car_vin", label: "VIN", type: "text", defaultValue: "",
        category: "vehicle", validation: { minLength: 17, maxLength: 17 },
      },
      {
        id: "car_plate", label: "ГРЗ", type: "text", defaultValue: "",
        category: "vehicle",
      },
      {
        id: "lease_start", label: "Дата начала аренды", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "lease_end", label: "Дата окончания аренды", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "rent_amount", label: "Арендная плата (руб./сутки)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "deposit_amount", label: "Залог (руб.)", type: "number", defaultValue: "",
        category: "payment",
      },
      {
        id: "mileage_limit", label: "Лимит пробега (км/сутки)", type: "number", defaultValue: "",
        category: "vehicle",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды транспортного средства</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{owner_fio}}}</strong>, паспорт {{{owner_passport}}}, именуемый «Арендодатель», и гражданин <strong>{{{tenant_fio}}}</strong>, паспорт {{{tenant_passport}}}, именуемый «Арендатор», заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель предоставляет, а Арендатор принимает во временное пользование автомобиль <strong>{{{car_brand}}}</strong>, VIN: {{{car_vin}}}, ГРЗ: {{{car_plate}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок и оплата</div>
  <p class="mb-4 text-justify">
    2.1. Срок аренды: с «{{{lease_start}}}» по «{{{lease_end}}}»
  </p>
  <p class="mb-4 text-justify">
    2.2. Арендная плата: <strong>{{{rent_amount}}} руб./сутки</strong>. Залог: {{{deposit_amount}}} руб.
  </p>
  <p class="mb-4 text-justify">2.3. Лимит пробега: {{{mileage_limit}}} км/сутки. Превышение оплачивается по 10 руб./км.</p>
  
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
      <div class="font-bold mb-2">Арендодатель:</div>
      <p><strong>{{{owner_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-2">Арендатор:</div>
      <p><strong>{{{tenant_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "power-of-attorney-auto",
    name: "Доверенность на управление ТС",
    category: "auto",
    actSource: "ст. 185–189 ГК РФ",
    lastUpdated: "Июнь 2026",
    description:
      "Доверенность на право управления, распоряжения транспортным средством и прохождения регистрационных действий.",
    suggestedDocs: ["dkp-auto", "gibdd-reg-app"],
    supportsOcr: true,
    printInstruction: "Печатать у нотариуса или в простой письменной форме",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата доверенности", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "owner_fio", label: "ФИО доверителя (владельца)", type: "text",
        defaultValue: "", category: "owner", validation: { required: true },
      },
      {
        id: "owner_passport", label: "Паспорт доверителя", type: "text",
        defaultValue: "",
        category: "owner",
      },
      {
        id: "owner_address", label: "Адрес доверителя", type: "text",
        defaultValue: "", category: "owner",
      },
      {
        id: "driver_fio", label: "ФИО доверенного лица", type: "text",
        defaultValue: "", category: "driver", validation: { required: true },
      },
      {
        id: "driver_passport", label: "Паспорт доверенного лица", type: "text",
        defaultValue: "",
        category: "driver",
      },
      {
        id: "driver_address", label: "Адрес доверенного лица", type: "text",
        defaultValue: "", category: "driver",
      },
      {
        id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "",
        category: "vehicle", validation: { required: true },
      },
      {
        id: "car_vin", label: "VIN", type: "text", defaultValue: "",
        category: "vehicle", validation: { minLength: 17, maxLength: 17 },
      },
      {
        id: "car_plate", label: "ГРЗ", type: "text", defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_pts", label: "ПТС (серия/номер)", type: "text", defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_sts", label: "СТС", type: "text", defaultValue: "",
        category: "vehicle",
      },
      {
        id: "valid_until", label: "Срок действия (до)", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "powers", label: "Полномочия", type: "checkbox", defaultValue: "true",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Доверенность на управление транспортным средством</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{owner_fio}}}</strong>, паспорт {{{owner_passport}}}, зарегистрированный по адресу: {{{owner_address}}}, именуемый «Доверитель», настоящей доверенностью уполномочивает:
  </p>
  <p class="mb-4 text-justify">
    Гражданина <strong>{{{driver_fio}}}</strong>, паспорт {{{driver_passport}}}, зарегистрированного по адресу: {{{driver_address}}}, именуемого «Доверенное лицо»:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Полномочия</div>
  <ul class="list-disc pl-6 mb-4 text-xs space-y-1">
    <li>Управлять транспортным средством: {{{car_brand}}}, VIN {{{car_vin}}}, ГРЗ {{{car_plate}}}, ПТС {{{car_pts}}}, СТС {{{car_sts}}}</li>
    <li>Проходить государственный технический осмотр</li>
    <li>Совершать регистрационные действия в ГИБДД</li>
    <li>Осуществлять ремонт и техническое обслуживание</li>
    <li>Представлять интересы Доверителя в страховых компаниях (ОСАГО)</li>
  </ul>
  <p class="mb-4 text-justify">Доверенность выдана сроком до «{{{valid_until}}}» (без права передоверия).</p>
  <div class="flex justify-between items-center text-xs mt-12 border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1">Доверитель:</div>
      <p><strong>{{{owner_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div class="text-right">
      <div class="font-bold mb-1">Доверенное лицо:</div>
      <p><strong>{{{driver_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "auto-lease",
    name: "Договор аренды автомобиля (без экипажа)",
    category: "auto",
    actSource: "ст. 642–649 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Аренда легкового автомобиля между физическими лицами без предоставления услуг по управлению.",
    suggestedDocs: ["rental-auto", "raspiska-money"],
    printInstruction: "Печатать в 2-х экземплярах, передать копию СТС",
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
        id: "lessor_fio", label: "ФИО Арендодателя", type: "text", defaultValue: "",
        category: "owner", validation: { required: true },
      },
      {
        id: "lessor_passport", label: "Паспорт Арендодателя", type: "text",
        defaultValue: "", category: "owner",
      },
      {
        id: "lessee_fio", label: "ФИО Арендатора", type: "text", defaultValue: "",
        category: "tenant", validation: { required: true },
      },
      {
        id: "lessee_passport", label: "Паспорт Арендатора", type: "text",
        defaultValue: "", category: "tenant",
      },
      {
        id: "car_brand", label: "Марка и модель", type: "text", defaultValue: "",
        category: "vehicle", validation: { required: true },
      },
      {
        id: "car_year", label: "Год выпуска", type: "number", defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_vin", label: "VIN", type: "text", defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_sts", label: "СТС", type: "text", defaultValue: "",
        category: "sts",
      },
      {
        id: "car_grz", label: "Госномер", type: "text", defaultValue: "",
        category: "grz",
      },
      {
        id: "rent_price_month", label: "Арендная плата в месяц (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "rent_start", label: "Начало аренды", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "rent_end", label: "Окончание аренды", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "mileage_limit", label: "Лимит пробега (км/мес.)", type: "number", defaultValue: "",
        category: "contract",
      },
      {
        id: "insurance", label: "Страхование", type: "select",
        options: [
          { label: "ОСАГО — за счёт арендодателя", value: "ОСАГО — за счёт арендодателя" },
          { label: "ОСАГО — за счёт арендатора", value: "ОСАГО — за счёт арендатора" },
        ],
        defaultValue: "ОСАГО — за счёт арендодателя", category: "insurance",
      },
      {
        id: "deposit_note", label: "Обеспечительный платёж (руб.)", type: "number", defaultValue: "",
        category: "payment",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды транспортного средства без экипажа</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lessor_fio}}}</strong>, паспорт {{{lessor_passport}}}, именуемый «Арендодатель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    гражданин <strong>{{{lessee_fio}}}</strong>, паспорт {{{lessee_passport}}}, именуемый «Арендатор», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель передаёт в аренду без предоставления услуг по управлению автомобиль <strong>{{{car_brand}}}</strong>, {{{car_year}}} г., VIN {{{car_vin}}}, госномер {{{car_grz}}}, СТС {{{car_sts}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Арендная плата</div>
  <p class="mb-4 text-justify">
    2.1. Арендная плата составляет <strong>{{{rent_price_month}}} руб.</strong> в месяц ({{{rent_price_month_words}}}), уплачивается ежемесячно авансом.
  </p>
  <p class="mb-4 text-justify">
    2.2. Обеспечительный платёж: {{{deposit_note}}} руб., возвращается при возврате автомобиля с учётом штрафов и повреждений.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок аренды</div>
  <p class="mb-4 text-justify">
    3.1. Срок аренды: с «{{{rent_start}}}» по «{{{rent_end}}}».
  </p>
  <p class="mb-4 text-justify">
    3.2. Лимит пробега: {{{mileage_limit}}} км в месяц. {{{insurance}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность</div>
  <p class="mb-4 text-justify">
    4.1. Арендатор несёт ответственность за сохранность автомобиля и соблюдение ПДД; штрафы ГИБДД — за счёт арендатора.
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
      <div class="font-bold mb-1">Арендодатель:</div>
      <p>{{{lessor_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Арендатор:</div>
      <p>{{{lessee_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "car-installment",
    name: "Купля-продажа авто в рассрочку",
    category: "auto",
    actSource: "ст. 454–491 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "ДКП автомобиля с оплатой в рассрочку: первоначальный взнос, ежемесячные платежи, неустойка.",
    suggestedDocs: ["dkp-auto", "raspiska-money", "spouse-consent-sell"],
    printInstruction: "Печатать в 3-х экземплярах; приложить расписку о получении аванса",
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
        id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "",
        category: "seller", validation: { required: true },
      },
      {
        id: "seller_passport", label: "Паспорт Продавца", type: "text",
        defaultValue: "", category: "seller",
      },
      {
        id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "",
        category: "buyer", validation: { required: true },
      },
      {
        id: "buyer_passport", label: "Паспорт Покупателя", type: "text",
        defaultValue: "", category: "buyer",
      },
      {
        id: "car_brand", label: "Марка и модель", type: "text", defaultValue: "",
        category: "vehicle", validation: { required: true },
      },
      {
        id: "car_year", label: "Год выпуска", type: "number", defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_vin", label: "VIN", type: "text", defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_sts", label: "СТС", type: "text", defaultValue: "",
        category: "sts",
      },
      {
        id: "car_grz", label: "Госномер", type: "text", defaultValue: "",
        category: "grz",
      },
      {
        id: "car_price", label: "Цена автомобиля (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "down_payment", label: "Первоначальный взнос (руб.)", type: "number", defaultValue: "",
        category: "payment",
      },
      {
        id: "monthly_payment", label: "Ежемесячный платёж (руб.)", type: "number", defaultValue: "",
        category: "payment",
      },
      {
        id: "payments_count", label: "Количество платежей", type: "number", defaultValue: "",
        category: "payment",
      },
      {
        id: "penalty_rate", label: "Неустойка за просрочку (% в день)", type: "number", defaultValue: "",
        category: "payment",
      },
      {
        id: "ownership_note", label: "Переход права собственности", type: "select",
        options: [
          { label: "После полной оплаты", value: "После полной оплаты" },
          { label: "С момента подписания договора", value: "С момента подписания договора" },
        ],
        defaultValue: "После полной оплаты", category: "vehicle",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи автомобиля с оплатой в рассрочку</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong>, паспорт {{{seller_passport}}}, именуемый «Продавец», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    гражданин <strong>{{{buyer_fio}}}</strong>, паспорт {{{buyer_passport}}}, именуемый «Покупатель», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец передаёт в собственность, а Покупатель принимает и оплачивает автомобиль <strong>{{{car_brand}}}</strong>, {{{car_year}}} г., VIN {{{car_vin}}}, госномер {{{car_grz}}}, СТС {{{car_sts}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок оплаты</div>
  <p class="mb-4 text-justify">
    2.1. Цена автомобиля составляет <strong>{{{car_price}}} руб.</strong> ({{{car_price_words}}}).
  </p>
  <p class="mb-4 text-justify">
    2.2. Оплата: первоначальный взнос {{{down_payment}}} руб. — при подписании договора; далее {{{payments_count}}} ежемесячных платежей по {{{monthly_payment}}} руб.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Переход права собственности</div>
  <p class="mb-4 text-justify">
    3.1. {{{ownership_note}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность покупателя</div>
  <p class="mb-4 text-justify">
    4.1. При просрочке платежа Покупатель уплачивает неустойку {{{penalty_rate}}}% от суммы просрочки за каждый день.
  </p>
  <p class="mb-4 text-justify">
    4.2. Автомобиль не может быть отчуждён (продан, заложен) до полной оплаты.
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
      <div class="font-bold mb-1">Продавец:</div>
      <p>{{{seller_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Покупатель:</div>
      <p>{{{buyer_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "power-of-attorney-car",
    name: "Доверенность на управление и распоряжение автомобилем",
    category: "auto",
    actSource: "ст. 185 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Доверенность на право управления ТС, подписи в ГИБДД, получения страхового возмещения и постановки на учёт.",
    suggestedDocs: ["dkp-auto"],
    supportsOcr: true,
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
        id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "",
        category: "vehicle", validation: { required: true },
      },
      {
        id: "car_year", label: "Год выпуска", type: "number", defaultValue: "", category: "vehicle",
      },
      {
        id: "car_vin", label: "VIN номер", type: "text", defaultValue: "",
        category: "vehicle",
      },
      {
        id: "car_plate", label: "Гос. знак", type: "text", defaultValue: "", category: "vehicle",
      },
      {
        id: "valid_until", label: "Действительна до", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "has_repair_right", label: "Право на ремонт и ТО", type: "checkbox", defaultValue: "true",
        category: "contract",
      },
      {
        id: "has_sell_right", label: "Право продажи ТС", type: "checkbox", defaultValue: "false",
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
    Я, гражданин <strong>{{{principal_fio}}}</strong>, паспорт {{{principal_passport}}}, зарегистрированный по адресу: {{{principal_address}}}, настоящей доверенностью уполномочиваю гражданина <strong>{{{agent_fio}}}</strong>, паспорт {{{agent_passport}}}, зарегистрированного по адресу: {{{agent_address}}}, управлять и распоряжаться транспортным средством <strong>{{{car_brand}}}</strong>, {{{car_year}}} года выпуска, VIN: {{{car_vin}}}, гос. номер {{{car_plate}}}.
  </p>
  <p class="mb-4 text-justify">
    В рамках предоставленных полномочий представитель вправе: быть представителем в ГИБДД по вопросу постановки и снятия транспортного средства с регистрационного учёта, получать свидетельства, регистрационные документы и государственные регистрационные знаки, расписываться за меня и совершать все необходимые действия, связанные с выполнением данного поручения.
  </p>
  <p class="mb-4 text-justify">
    {{#has_repair_right}}Дополнительно наделён правом производить ремонт и техническое обслуживание транспортного средства, получать полис ОСАГО.{{/has_repair_right}}
  </p>
  <p class="mb-4 text-justify">
    {{#has_sell_right}}Дополнительно наделён правом продажи указанного транспортного средства за цену и на условиях по своему усмотрению, с правом получения следуемых за проданное имущество денег.{{/has_sell_right}}
  </p>
  <p class="mb-4 text-justify">
    Доверенность выдана сроком до «{{{valid_until}}}» {{#has_substitution}}с правом передоверия полномочий третьим лицам{{/has_substitution}}{{^has_substitution}}без права передоверия полномочий третьим лицам{{/has_substitution}}.
  </p>
  <div class="border-b border-zinc-950 w-56 h-5 mt-6"></div>
  <p class="text-xs"><strong>{{{principal_fio}}}</strong></p>
</div>`,
  },
{
    id: "gift-car",
    name: "Договор дарения автомобиля",
    category: "auto",
    actSource: "ст. 572-581 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор дарения транспортного средства: безвозмездная передача автомобиля, переоформление в ГИБДД.",
    suggestedDocs: ["dkp-auto", "act-transfer-auto"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "donor_fio", label: "Даритель (ФИО)", type: "text", defaultValue: "", category: "donor", validation: { required: true } },
      { id: "donor_passport", label: "Паспорт дарителя", type: "text", defaultValue: "", category: "donor" },
      { id: "donee_fio", label: "Одаряемый (ФИО)", type: "text", defaultValue: "", category: "donee", validation: { required: true } },
      { id: "donee_passport", label: "Паспорт одаряемого", type: "text", defaultValue: "", category: "donee" },
      { id: "car_brand", label: "Марка и модель", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_year", label: "Год выпуска", type: "text", defaultValue: "", category: "vehicle" },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle" },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "car_sts", label: "СТС", type: "text", defaultValue: "", category: "sts" },
      { id: "relationship", label: "Степень родства", type: "text", defaultValue: "", category: "family" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор дарения автомобиля</div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{donor_fio}}}</strong> (паспорт {{{donor_passport}}}), именуемый «Даритель», с одной стороны, и
    гражданка <strong>{{{donee_fio}}}</strong> (паспорт {{{donee_passport}}}), именуемая «Одаряемый», с другой стороны,
    заключили настоящий договор (ст. 572-581 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Даритель безвозмездно передаёт в собственность Одаряемого автомобиль: {{{car_brand}}}, {{{car_year}}} года выпуска, VIN {{{car_vin}}}, государственный регистрационный знак {{{car_plate}}}, ПТС/СТС {{{car_sts}}}.</p>
  <p class="font-bold mb-2">2. Стороны</p>
  <p class="mb-3 text-justify">2.1. Стороны состоят в следующих отношениях: {{{relationship}}}. Договор дарения не имеет встречного предоставления (ст. 572 ГК РФ).</p>
  <p class="font-bold mb-2">3. Передача автомобиля</p>
  <p class="mb-3 text-justify">3.1. Автомобиль передаётся Одаряемому одновременно с подписанием договора вместе с ПТС, СТС и комплектом ключей. Одаряемый вправе зарегистрировать автомобиль в ГИБДД на своё имя в течение 10 дней.</p>
  <p class="font-bold mb-2">4. Отмена дарения</p>
  <p class="mb-3 text-justify">4.1. Даритель вправе отменить дарение в случаях, предусмотренных ст. 578 ГК РФ.</p>
  
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
    id: "towing-services",
    name: "Договор на эвакуацию транспортного средства",
    category: "auto",
    actSource: "ст. 779-783 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на услуги эвакуатора: марка и госномер ТС, точка эвакуации и пункт доставки, тариф, фиксация состояния ТС, ответственность за повреждения.",
    suggestedDocs: ["raspiska-money"],
    printInstruction: "Печать на листе А4; состояние ТС при погрузке фиксируется фото- и видеосъёмкой, повреждения оформляются актом",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_company", label: "Исполнитель (эвакуационная служба)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_fio", label: "Заказчик (ФИО)", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_phone", label: "Телефон заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "car_brand", label: "Транспортное средство", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "pickup_point", label: "Точка эвакуации", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "drop_point", label: "Пункт доставки", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "tariff", label: "Тариф (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "damage_act", label: "Фиксация состояния ТС", type: "text", defaultValue: "", category: "other" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание услуг эвакуации транспортного средства</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}), именуемый «Исполнитель», с одной стороны, и
    <strong>{{{customer_fio}}}</strong> (тел. {{{customer_phone}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 779 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется осуществить эвакуацию ТС: {{{car_brand}}}, из точки: {{{pickup_point}}}, в пункт: {{{drop_point}}}.</p>
  <p class="mb-3 text-justify">1.2. {{{damage_act}}}.</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Стоимость услуг: {{{tariff}}}. {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Ответственность</p>
  <p class="mb-3 text-justify">3.1. Исполнитель несёт ответственность за повреждения ТС, возникшие при погрузке, перевозке и разгрузке, подтверждённые актом (ст. 401 ГК РФ).</p>
  <p class="mb-3 text-justify">3.2. Заказчик несёт ответственность за достоверность сведений о ТС и за наличие предметов, запрещённых к перевозке.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_company}}}</p>
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
    id: "car-lease-buyout",
    name: "Договор аренды автомобиля с правом выкупа",
    category: "auto",
    actSource: "ст. 624, 642-649 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор аренды автомобиля с правом последующего выкупа: арендная плата, выкупная цена, переход права собственности после оплаты (ст. 624 ГК РФ). Отличие от лизинга — продавец выбирает сам арендодатель.",
    suggestedDocs: ["auto-lease", "dkp-auto", "act-transfer-auto"],
    printInstruction: "Печать на листе А4; после внесения выкупной цены право собственности переходит по акту, ДКП не требуется (ст. 624 ГК РФ)",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "owner_fio", label: "Арендодатель (ФИО)", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "owner_passport", label: "Паспорт арендодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "tenant_fio", label: "Арендатор (ФИО)", type: "text", defaultValue: "", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Паспорт арендатора", type: "text", defaultValue: "", category: "tenant" },
      { id: "car_brand", label: "Автомобиль", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Госномер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "rent_price", label: "Арендная плата (руб./мес)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "buyout_price", label: "Выкупная цена (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "term_months", label: "Срок аренды (мес.)", type: "text", defaultValue: "", category: "contract" },
      { id: "start_date", label: "Дата передачи", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Дата выкупа", type: "date", defaultValue: "", category: "contract" },
      { id: "insurance", label: "Страхование", type: "text", defaultValue: "", category: "vehicle" },
      { id: "penalty", label: "Неустойка", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды автомобиля с правом выкупа</div>
  <p class="mb-4 text-justify">
    <strong>{{{owner_fio}}}</strong> (паспорт: {{{owner_passport}}}), именуемый «Арендодатель», с одной стороны, и
    <strong>{{{tenant_fio}}}</strong> (паспорт: {{{tenant_passport}}}), именуемый «Арендатор», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 624, 642 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Арендодатель передаёт, а Арендатор принимает во временное владение и пользование автомобиль: {{{car_brand}}}, гос. № {{{car_plate}}}, с правом последующего выкупа.</p>
  <p class="mb-3 text-justify">1.2. Автомобиль передаётся по акту приёма-передачи «{{{start_date}}}».</p>
  <p class="font-bold mb-2">2. Арендная плата и выкуп</p>
  <p class="mb-3 text-justify">2.1. Арендная плата: <strong>{{{rent_price}}} руб.</strong> ({{{rent_price_words}}}) в месяц.</p>
  <p class="mb-3 text-justify">2.2. По истечении срока {{{term_months}}} месяцев Арендатор вправе выкупить автомобиль по цене <strong>{{{buyout_price}}} руб.</strong> ({{{buyout_price_words}}}). С момента полной оплаты право собственности переходит к Арендатору (ст. 624 ГК РФ).</p>
  <p class="font-bold mb-2">3. Обязанности и ответственность</p>
  <p class="mb-3 text-justify">3.1. Арендатор обязан поддерживать автомобиль в исправном состоянии, не передавать третьим лицам, нести расходы на содержание. {{{insurance}}}.</p>
  <p class="mb-3 text-justify">3.2. За просрочку платежей Арендатор уплачивает неустойку {{{penalty}}} от суммы задолженности; при просрочке свыше 2 месяцев Арендодатель вправе расторгнуть договор (ст. 619 ГК РФ).</p>
  
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
      <p class="font-bold mb-1">Арендодатель:</p>
      <p class="mb-6">{{{owner_fio}}}</p>
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
    id: "dkp-trailer",
    name: "Договор купли-продажи прицепа",
    category: "auto",
    actSource: "ст. 454 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи прицепа к легковому автомобилю: характеристики прицепа (марка, год, VIN, госномер), цена, передача. Регистрация в ГИБДД — в течение 10 дней.",
    suggestedDocs: ["dkp-auto", "act-transfer-auto"],
    printInstruction: "Печать на листе А4; после покупки прицеп подлежит регистрации в ГИБДД в течение 10 дней",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "seller_fio", label: "Продавец (ФИО)", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "Покупатель (ФИО)", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "trailer_brand", label: "Марка, модель прицепа", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "trailer_year", label: "Год выпуска", type: "text", defaultValue: "", category: "vehicle" },
      { id: "trailer_vin", label: "VIN/заводской номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "trailer_plate", label: "Госномер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "trailer_pts", label: "ПТС", type: "text", defaultValue: "", category: "vehicle" },
      { id: "trailer_price", label: "Цена (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "trailer_mass", label: "Разрешённая масса (кг)", type: "text", defaultValue: "", category: "vehicle" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи прицепа</div>
  <p class="mb-4 text-justify">
    <strong>{{{seller_fio}}}</strong> (паспорт: {{{seller_passport}}}), именуемый «Продавец», с одной стороны, и
    <strong>{{{buyer_fio}}}</strong> (паспорт: {{{buyer_passport}}}), именуемый «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 454 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Продавец передаёт в собственность Покупателя прицеп: {{{trailer_brand}}}, {{{trailer_year}}} г.в., VIN {{{trailer_vin}}}, гос. № {{{trailer_plate}}}, разрешённая масса {{{trailer_mass}}} кг. ПТС {{{trailer_pts}}}.</p>
  <p class="mb-3 text-justify">1.2. Прицеп не продан, не заложен, в споре и под арестом не состоит, правами третьих лиц не обременён.</p>
  <p class="font-bold mb-2">2. Цена и порядок расчётов</p>
  <p class="mb-3 text-justify">2.1. Цена прицепа составляет <strong>{{{trailer_price}}} руб.</strong> ({{{trailer_price_words}}}), уплачивается при подписании договора.</p>
  <p class="font-bold mb-2">3. Передача и регистрация</p>
  <p class="mb-3 text-justify">3.1. Прицеп передаётся по акту приёма-передачи. Право собственности переходит с момента подписания договора.</p>
  <p class="mb-3 text-justify">3.2. Покупатель обязан зарегистрировать прицеп в ГИБДД в течение 10 дней с момента приобретения.</p>
  
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
    id: "dkp-car-credit",
    name: "Договор купли-продажи автомобиля в кредит",
    category: "auto",
    actSource: "ст. 454, 488 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи автомобиля с оплатой за счёт кредитных средств банка. Учитывает переход залога на авто к банку до полной оплаты.",
    suggestedDocs: ["act-transfer-auto", "raspiska-money", "gibdd-reg-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4 с двух сторон",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца (серия №)", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_address", label: "Адрес продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя (серия №)", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_address", label: "Адрес покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_year", label: "Год выпуска", type: "number", defaultValue: "", category: "vehicle" },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { minLength: 17, maxLength: 17, required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "contract_price", label: "Стоимость авто (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "contract" },
      { id: "credit_amount", label: "Сумма кредита (руб.)", type: "number", defaultValue: "", category: "contract" },
      { id: "credit_bank", label: "Банк-кредитор", type: "text", defaultValue: "", category: "contract" },
      { id: "credit_rate", label: "Ставка % годовых", type: "text", defaultValue: "", category: "contract" },
      { id: "credit_term", label: "Срок кредита (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "prepayment", label: "Собственные средства покупателя (руб.)", type: "number", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `

<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи транспортного средства в кредит</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_address}}}), именуемый в дальнейшем «Продавец», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_address}}}), именуемый в дальнейшем «Покупатель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец передаёт в собственность Покупателя, а Покупатель принимает и оплачивает транспортное средство: {{{car_brand}}}, {{{car_year}}} года выпуска, VIN {{{car_vin}}}, государственный регистрационный знак {{{car_plate}}}.
  </p>
  <p class="mb-4 text-justify">
    1.2. Продавец гарантирует, что ТС не находится в залоге, под арестом, не обременено правами третьих лиц, за исключением залога в пользу {{{credit_bank}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость ТС составляет <strong>{{{contract_price}}} рублей</strong> (прописью: {{{contract_price_words}}}).
  </p>
  <p class="mb-4 text-justify">
    2.2. Оплата производится следующим образом: собственные средства {{{prepayment}}} рублей вносится Покупателем при подписании договора; оставшаяся часть {{{credit_amount}}} рублей оплачивается за счёт кредитных средств, предоставленных {{{credit_bank}}} (ставка {{{credit_rate}}}% годовых, срок {{{credit_term}}} месяцев).
  </p>
  <p class="mb-4 text-justify">
    2.3. До полного погашения кредита автомобиль находится в залоге у {{{credit_bank}}} в соответствии с кредитным договором.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача транспортного средства</div>
  <p class="mb-4 text-justify">
    3.1. Передача ТС осуществляется по Акту приёма-передачи в день подписания настоящего договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    4.1. За неисполнение или ненадлежащее исполнение обязательств стороны несут ответственность в соответствии с законодательством РФ.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении.
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
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>
`,
  },
{
    id: "car-rental-daily",
    name: "Договор проката автомобиля (посуточно)",
    category: "auto",
    actSource: "ст. 626 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор проката автомобиля без экипажа посуточно. Подходит для краткосрочной аренды частным лицам.",
    suggestedDocs: ["act-transfer-auto", "raspiska-money", "doverennost"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "lessor_fio", label: "ФИО Арендодателя", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "lessor_passport", label: "Паспорт арендодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "lessor_address", label: "Адрес арендодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "tenant_fio", label: "ФИО Арендатора", type: "text", defaultValue: "", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Паспорт арендатора", type: "text", defaultValue: "", category: "tenant" },
      { id: "tenant_address", label: "Адрес арендатора", type: "text", defaultValue: "", category: "tenant" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "rent_amount", label: "Стоимость проката (руб./сутки)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "deposit", label: "Залог (руб.)", type: "number", defaultValue: "", category: "contract" },
      { id: "rent_start", label: "Дата начала аренды", type: "date", defaultValue: "", category: "contract" },
      { id: "rent_end", label: "Дата окончания аренды", type: "date", defaultValue: "", category: "contract" },
      { id: "mileage_limit", label: "Суточный лимит пробега (км)", type: "number", defaultValue: "", category: "contract" },
      { id: "excess_price", label: "Стоимость 1 км сверх лимита (руб.)", type: "number", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `

<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор проката автомобиля</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lessor_fio}}}</strong> (паспорт {{{lessor_passport}}}, адрес: {{{lessor_address}}}), именуемый в дальнейшем «Арендодатель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{tenant_fio}}}</strong> (паспорт {{{tenant_passport}}}, адрес: {{{tenant_address}}}), именуемый в дальнейшем «Арендатор», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель предоставляет Арендатору во временное владение и пользование автомобиль: {{{car_brand}}}, VIN {{{car_vin}}}, государственный регистрационный знак {{{car_plate}}} (далее — ТС), без оказания услуг по управлению.
  </p>
  <p class="mb-4 text-justify">
    1.2. ТС передаётся Арендатору в исправном состоянии по Акту приёма-передачи, являющемуся неотъемлемой частью договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок и стоимость проката</div>
  <p class="mb-4 text-justify">
    2.1. Срок проката: с {{{rent_start}}} по {{{rent_end}}} включительно.
  </p>
  <p class="mb-4 text-justify">
    2.2. Стоимость проката составляет <strong>{{{rent_amount}}} рублей</strong> в сутки. Залог (обеспечительный платёж) — {{{deposit}}} рублей, возвращается при возврате ТС в надлежащем состоянии.
  </p>
  <p class="mb-4 text-justify">
    2.3. Суточный лимит пробега — {{{mileage_limit}}} км. Пробег сверх лимита оплачивается из расчёта {{{excess_price}}} рублей за 1 км.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">
    3.1. Арендатор обязуется использовать ТС по назначению, не передавать его третьим лицам, поддерживать в исправном состоянии, нести расходы на топливо и оплату парковок.
  </p>
  <p class="mb-4 text-justify">
    3.2. Арендодатель обязуется передать ТС в состоянии, соответствующем условиям договора, и обеспечить его техническую исправность на весь срок проката.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    4.1. В случае повреждения или утраты ТС Арендатор возмещает Арендодателю стоимость ремонта (рыночную стоимость ТС), за вычетом ранее внесённого залога.
  </p>
  <p class="mb-4 text-justify">
    4.2. За нарушение сроков возврата ТС Арендатор уплачивает штраф в размере двойной суточной стоимости проката за каждый день просрочки.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении.
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
      <div class="font-bold mb-2 uppercase text-black">Арендодатель:</div>
      <p class="mb-1"><strong>{{{lessor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{lessor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lessor_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендатор:</div>
      <p class="mb-1"><strong>{{{tenant_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{tenant_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{tenant_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>
`,
  },
{
    id: "car-lease-crew",
    name: "Договор аренды автомобиля с экипажем",
    category: "auto",
    actSource: "ст. 632 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Аренда автомобиля с водителем (экипажем). Услуги по управлению и технической эксплуатации оказывает арендодатель.",
    suggestedDocs: ["act-transfer-auto", "raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "lessor_fio", label: "ФИО Арендодателя", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "lessor_passport", label: "Паспорт арендодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "lessor_address", label: "Адрес арендодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "tenant_company", label: "Название организации (Арендатор)", type: "text", defaultValue: "", category: "tenant" },
      { id: "tenant_inn", label: "ИНН арендатора", type: "text", defaultValue: "", category: "tenant" },
      { id: "tenant_director", label: "Директор арендатора", type: "text", defaultValue: "", category: "tenant" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "rent_amount", label: "Стоимость аренды с экипажем (руб./час)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "rent_start", label: "Дата начала аренды", type: "date", defaultValue: "", category: "contract" },
      { id: "rent_end", label: "Дата окончания аренды", type: "date", defaultValue: "", category: "contract" },
      { id: "driver_fio", label: "Водитель (экипаж)", type: "text", defaultValue: "", category: "driver" },
    ],
    previewTemplate: `

<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды транспортного средства с экипажем</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lessor_fio}}}</strong> (паспорт {{{lessor_passport}}}, адрес: {{{lessor_address}}}), именуемый в дальнейшем «Арендодатель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{tenant_company}}}</strong> (ИНН {{{tenant_inn}}}) в лице {{{tenant_director}}}, действующего на основании Устава, именуемое в дальнейшем «Арендатор», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель предоставляет Арендатору во временное владение и пользование автомобиль {{{car_brand}}}, VIN {{{car_vin}}}, гос. номер {{{car_plate}}}, и оказывает своими силами услуги по управлению им и его технической эксплуатации (с экипажем). Водитель: {{{driver_fio}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость услуг составляет <strong>{{{rent_amount}}} рублей</strong> за час работы. Оплата производится еженедельно на основании акта оказанных услуг.
  </p>
  <p class="mb-4 text-justify">
    2.2. Расходы на топливо и платные стоянки несёт Арендатор.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок аренды</div>
  <p class="mb-4 text-justify">
    3.1. Договор заключён на срок с {{{rent_start}}} по {{{rent_end}}}. Договор может быть продлён по соглашению сторон.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности сторон</div>
  <p class="mb-4 text-justify">
    4.1. Арендодатель обязан поддерживать ТС в надлежащем состоянии, обеспечивать его ремонт и техническое обслуживание.
  </p>
  <p class="mb-4 text-justify">
    4.2. Арендатор обязан оплачивать услуги в срок, использовать ТС по назначению, не передавать управление третьим лицам.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    5.1. Ответственность за вред, причинённый третьим лицам ТС, его механизмами и экипажем, несёт Арендодатель (ст. 640 ГК РФ).
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Форс-мажор</div>
  <p class="mb-4 text-justify">
    6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении.
  </p>
  <p class="mb-4 text-justify">
    6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">7. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">
    7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-4 text-justify">
    7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>

  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендодатель:</div>
      <p class="mb-1"><strong>{{{lessor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{lessor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lessor_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендатор:</div>
      <p class="mb-1"><strong>{{{tenant_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{tenant_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">В лице: {{{tenant_director}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>
`,
  },
{
    id: "dkp-moto",
    name: "Договор купли-продажи мотоцикла",
    category: "auto",
    actSource: "ст. 454 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи мотоцикла, мопеда или мототехники между физическими лицами. Аналогичен ДКП автомобиля.",
    suggestedDocs: ["act-transfer-auto", "raspiska-money", "gibdd-reg-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4 с двух сторон",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "seller_address", label: "Адрес продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "buyer_address", label: "Адрес покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "moto_brand", label: "Марка и модель мотоцикла", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "moto_year", label: "Год выпуска", type: "number", defaultValue: "", category: "vehicle" },
      { id: "moto_vin", label: "Номер рамы (VIN)", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "moto_engine", label: "Номер двигателя", type: "text", defaultValue: "", category: "vehicle" },
      { id: "moto_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "moto_mileage", label: "Пробег (км)", type: "number", defaultValue: "", category: "vehicle" },
      { id: "contract_price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `

<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи мотоцикла</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_address}}}), именуемый в дальнейшем «Продавец», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_address}}}), именуемый в дальнейшем «Покупатель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец передаёт в собственность Покупателя, а Покупатель принимает и оплачивает мотоцикл:
  </p>
  <ul class="list-disc pl-6 mb-4 text-xs space-y-1">
    <li>Марка, модель: <strong>{{{moto_brand}}}</strong></li>
    <li>Год выпуска: <strong>{{{moto_year}}}</strong></li>
    <li>Номер рамы (VIN): <strong>{{{moto_vin}}}</strong></li>
    <li>Номер двигателя: {{{moto_engine}}}</li>
    <li>Государственный регистрационный знак: {{{moto_plate}}}</li>
    <li>Пробег: {{{moto_mileage}}} км</li>
  </ul>
  <p class="mb-4 text-justify">
    1.2. Продавец гарантирует, что мотоцикл не находится в залоге, под арестом, не обременён правами третьих лиц.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость мотоцикла составляет <strong>{{{contract_price}}} рублей</strong> (прописью: {{{contract_price_words}}}).
  </p>
  <p class="mb-4 text-justify">
    2.2. Покупатель оплачивает стоимость при подписании настоящего договора. Передача денежных средств подтверждается распиской.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача мотоцикла</div>
  <p class="mb-4 text-justify">
    3.1. Мотоцикл передаётся Покупателю по Акту приёма-передачи вместе с ПТС и комплектом ключей в день подписания договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    4.1. В случае изъятия мотоцикла у Покупателя третьими лицами Продавец обязан возместить Покупателю понесённые убытки.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении.
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
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>
`,
  },
{
    id: "dkp-atv",
    name: "Договор купли-продажи квадроцикла (снегохода)",
    category: "auto",
    actSource: "ст. 454 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи квадроцикла, снегохода или иной внедорожной мототехники между физическими лицами.",
    suggestedDocs: ["act-transfer-auto", "raspiska-money", "gibdd-reg-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "seller_address", label: "Адрес продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "buyer_address", label: "Адрес покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "atv_type", label: "Тип ТС", type: "select", defaultValue: "Квадроцикл", category: "vehicle", options: [ { label: "Квадроцикл", value: "Квадроцикл" }, { label: "Снегоход", value: "Снегоход" }, { label: "Мотовездеход", value: "Мотовездеход" } ] },
      { id: "atv_brand", label: "Марка и модель", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "atv_year", label: "Год выпуска", type: "number", defaultValue: "", category: "vehicle" },
      { id: "atv_vin", label: "Номер рамы (VIN)", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "atv_engine", label: "Номер двигателя", type: "text", defaultValue: "", category: "vehicle" },
      { id: "contract_price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `

<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи квадроцикла (снегохода)</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_address}}}), именуемый в дальнейшем «Продавец», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_address}}}), именуемый в дальнейшем «Покупатель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец передаёт в собственность Покупателя, а Покупатель принимает и оплачивает {{{atv_type}}}: <strong>{{{atv_brand}}}</strong>, {{{atv_year}}} года выпуска, номер рамы (VIN) {{{atv_vin}}}, номер двигателя {{{atv_engine}}}.
  </p>
  <p class="mb-4 text-justify">
    1.2. Продавец гарантирует, что {{{atv_type}}} не находится в залоге, под арестом, не обременён правами третьих лиц.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость составляет <strong>{{{contract_price}}} рублей</strong> (прописью: {{{contract_price_words}}}).
  </p>
  <p class="mb-4 text-justify">
    2.2. Оплата производится при подписании настоящего договора наличными денежными средствами.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача ТС</div>
  <p class="mb-4 text-justify">
    3.1. {{{atv_type}}} передаётся Покупателю по Акту приёма-передачи вместе с документами (ПСМ/ЭПСМ) в день подписания договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    4.1. Стороны несут ответственность за неисполнение условий настоящего договора в соответствии с законодательством РФ.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении.
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
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>
`,
  },
{
    id: "car-repair",
    name: "Договор на ремонт автомобиля (СТО)",
    category: "auto",
    actSource: "ст. 702, 730 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор на техническое обслуживание и ремонт автомобиля в автосервисе. Составляется между владельцем ТС и исполнителем (СТО).",
    suggestedDocs: ["act-works", "raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_fio", label: "ФИО Заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "customer_address", label: "Адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Название СТО (Исполнитель)", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_address", label: "Адрес СТО", type: "text", defaultValue: "", category: "executor" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "work_description", label: "Перечень работ", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_price", label: "Стоимость работ (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "start_date", label: "Дата начала работ", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Дата окончания работ", type: "date", defaultValue: "", category: "contract" },
      { id: "warranty_period", label: "Гарантия (мес.)", type: "number", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `

<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на техническое обслуживание и ремонт автомобиля</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{customer_fio}}}</strong> (паспорт {{{customer_passport}}}, адрес: {{{customer_address}}}), именуемый в дальнейшем «Заказчик», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_address}}}), именуемое в дальнейшем «Исполнитель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Исполнитель обязуется выполнить работы по ремонту и техническому обслуживанию автомобиля {{{car_brand}}}, VIN {{{car_vin}}}, гос. номер {{{car_plate}}}:
  </p>
  <p class="mb-4 text-justify">
    1.2. Перечень работ: <strong>{{{work_description}}}</strong>.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и сроки</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость работ составляет <strong>{{{contract_price}}} рублей</strong> и включает стоимость запасных частей и материалов.
  </p>
  <p class="mb-4 text-justify">
    2.2. Срок выполнения работ: с {{{start_date}}} по {{{end_date}}}. Исполнитель вправе досрочно выполнить работы.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Гарантия</div>
  <p class="mb-4 text-justify">
    3.1. Гарантия на выполненные работы составляет {{{warranty_period}}} месяцев. При обнаружении недостатков в гарантийный период Исполнитель устраняет их безвозмездно.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    4.1. Исполнитель несёт ответственность за сохранность автомобиля, переданного на ремонт. За просрочку выполнения работ Заказчик вправе требовать неустойку в размере 3% от стоимости работ за каждый день просрочки.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении.
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
      <div class="font-bold mb-2 uppercase text-black">Заказчик:</div>
      <p class="mb-1"><strong>{{{customer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{customer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">В лице: {{{executor_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>
`,
  },
{
    id: "car-storage",
    name: "Договор хранения автомобиля",
    category: "auto",
    actSource: "ст. 886 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор хранения транспортного средства на охраняемой стоянке (платная парковка, гараж).",
    suggestedDocs: ["act-transfer-auto", "raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "depositor_fio", label: "ФИО Поклажедателя", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
      { id: "depositor_passport", label: "Паспорт поклажедателя", type: "text", defaultValue: "", category: "sender" },
      { id: "depositor_address", label: "Адрес поклажедателя", type: "text", defaultValue: "", category: "sender" },
      { id: "keeper_company", label: "Название Хранителя", type: "text", defaultValue: "", category: "recipient" },
      { id: "keeper_inn", label: "ИНН хранителя", type: "text", defaultValue: "", category: "recipient" },
      { id: "keeper_address", label: "Адрес стоянки", type: "text", defaultValue: "", category: "recipient" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "storage_start", label: "Дата начала хранения", type: "date", defaultValue: "", category: "contract" },
      { id: "storage_end", label: "Дата окончания хранения", type: "date", defaultValue: "", category: "contract" },
      { id: "storage_price", label: "Стоимость хранения (руб./мес.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate: `

<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор хранения транспортного средства</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{depositor_fio}}}</strong> (паспорт {{{depositor_passport}}}, адрес: {{{depositor_address}}}), именуемый в дальнейшем «Поклажедатель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{keeper_company}}}</strong> (ИНН {{{keeper_inn}}}, адрес: {{{keeper_address}}}), именуемое в дальнейшем «Хранитель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Хранитель обязуется хранить транспортное средство {{{car_brand}}}, VIN {{{car_vin}}}, гос. номер {{{car_plate}}}, переданное Поклажедателем, и возвратить его в сохранности.
  </p>
  <p class="mb-4 text-justify">
    1.2. Место хранения: {{{keeper_address}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок и стоимость хранения</div>
  <p class="mb-4 text-justify">
    2.1. Срок хранения: с {{{storage_start}}} по {{{storage_end}}}.
  </p>
  <p class="mb-4 text-justify">
    2.2. Стоимость хранения составляет <strong>{{{storage_price}}} рублей</strong> в месяц, оплачивается ежемесячно предоплатой.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности хранителя</div>
  <p class="mb-4 text-justify">
    3.1. Хранитель обязуется обеспечить сохранность ТС, принимать необходимые меры для его охраны, не использовать ТС без согласия Поклажедателя.
  </p>
  <p class="mb-4 text-justify">
    3.2. При причинении ТС ущерба Хранитель возмещает Поклажедателю стоимость восстановительного ремонта.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    4.1. Хранитель отвечает за утрату, недостачу или повреждение ТС в соответствии со ст. 901 ГК РФ.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении.
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
      <div class="font-bold mb-2 uppercase text-black">Поклажедатель:</div>
      <p class="mb-1"><strong>{{{depositor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{depositor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{depositor_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Хранитель:</div>
      <p class="mb-1"><strong>{{{keeper_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{keeper_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">В лице: {{{keeper_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>
`,
  },
{
    id: "car-free-use",
    name: "Договор безвозмездного пользования автомобилем",
    category: "auto",
    actSource: "ст. 689 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор ссуды — передача автомобиля в безвозмездное временное пользование. Подходит для передачи авто родственникам и знакомым.",
    suggestedDocs: ["act-transfer-auto"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "lender_fio", label: "ФИО Ссудодателя", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "lender_passport", label: "Паспорт ссудодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "lender_address", label: "Адрес ссудодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "borrower_fio", label: "ФИО Ссудополучателя", type: "text", defaultValue: "", category: "borrower", validation: { required: true } },
      { id: "borrower_passport", label: "Паспорт ссудополучателя", type: "text", defaultValue: "", category: "borrower" },
      { id: "borrower_address", label: "Адрес ссудополучателя", type: "text", defaultValue: "", category: "borrower" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "use_period", label: "Срок пользования (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "purpose", label: "Цель использования", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `

<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор безвозмездного пользования автомобилем</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lender_fio}}}</strong> (паспорт {{{lender_passport}}}, адрес: {{{lender_address}}}), именуемый в дальнейшем «Ссудодатель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{borrower_fio}}}</strong> (паспорт {{{borrower_passport}}}, адрес: {{{borrower_address}}}), именуемый в дальнейшем «Ссудополучатель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Ссудодатель передаёт в безвозмездное временное пользование Ссудополучателю автомобиль {{{car_brand}}}, VIN {{{car_vin}}}, гос. номер {{{car_plate}}} (далее — ТС).
  </p>
  <p class="mb-4 text-justify">
    1.2. Цель использования: {{{purpose}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок пользования</div>
  <p class="mb-4 text-justify">
    2.1. ТС передаётся в пользование на срок {{{use_period}}} месяцев с момента подписания договора. Ссудодатель вправе в любой момент отказаться от договора, предупредив Ссудополучателя за 30 дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности ссудополучателя</div>
  <p class="mb-4 text-justify">
    3.1. Ссудополучатель обязуется поддерживать ТС в исправном состоянии, нести расходы на его содержание, эксплуатацию и ремонт, не передавать ТС третьим лицам без согласия Ссудодателя.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    4.1. При повреждении ТС Ссудополучатель возмещает Ссудодателю стоимость ремонта. Ссудодатель отвечает за недостатки ТС, которые он умышленно не оговорил при передаче.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении.
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
      <div class="font-bold mb-2 uppercase text-black">Ссудодатель:</div>
      <p class="mb-1"><strong>{{{lender_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{lender_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lender_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Ссудополучатель:</div>
      <p class="mb-1"><strong>{{{borrower_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{borrower_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{borrower_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>
`,
  },
{
    id: "car-trade-in",
    name: "Договор купли-продажи авто по схеме трейд-ин",
    category: "auto",
    actSource: "ст. 454, 453 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор покупки нового автомобиля с зачётом стоимости старого по схеме trade-in. Заключается между автодилером и покупателем.",
    suggestedDocs: ["act-transfer-auto", "dkp-auto", "gibdd-reg-app"],
    supportsOcr: true,
    printInstruction: "Печать на двух листах А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "seller_company", label: "Название дилера (Продавец)", type: "text", defaultValue: "", category: "seller" },
      { id: "seller_inn", label: "ИНН дилера", type: "text", defaultValue: "", category: "seller" },
      { id: "seller_address", label: "Адрес дилера", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "buyer_address", label: "Адрес покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "new_car_brand", label: "Новый автомобиль (марка, модель)", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "new_car_vin", label: "VIN нового авто", type: "text", defaultValue: "", category: "vehicle" },
      { id: "old_car_brand", label: "Сдаваемый автомобиль (марка, модель)", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "old_car_vin", label: "VIN сдаваемого авто", type: "text", defaultValue: "", category: "vehicle" },
      { id: "old_car_plate", label: "Гос. номер сдаваемого авто", type: "text", defaultValue: "", category: "vehicle" },
      { id: "old_car_price", label: "Оценочная стоимость сдаваемого авто (руб.)", type: "number", defaultValue: "", category: "contract" },
      { id: "new_car_price", label: "Стоимость нового авто (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "surcharge", label: "Доплата покупателя (руб.)", type: "number", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `

<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи автомобиля (trade-in)</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{seller_company}}}</strong> (ИНН {{{seller_inn}}}, адрес: {{{seller_address}}}), именуемое в дальнейшем «Продавец», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_address}}}), именуемый в дальнейшем «Покупатель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец передаёт в собственность Покупателя новый автомобиль {{{new_car_brand}}}, VIN {{{new_car_vin}}} (далее — Новое ТС).
  </p>
  <p class="mb-4 text-justify">
    1.2. Покупатель передаёт в собственность Продавца сдаваемый автомобиль {{{old_car_brand}}}, VIN {{{old_car_vin}}}, гос. номер {{{old_car_plate}}} (далее — Сдаваемое ТС).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость Нового ТС составляет <strong>{{{new_car_price}}} рублей</strong>.
  </p>
  <p class="mb-4 text-justify">
    2.2. Оценочная стоимость Сдаваемого ТС составляет <strong>{{{old_car_price}}} рублей</strong> и засчитывается в счёт оплаты Нового ТС.
  </p>
  <p class="mb-4 text-justify">
    2.3. Покупатель доплачивает разницу в размере <strong>{{{surcharge}}} рублей</strong> при подписании настоящего договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача транспортных средств</div>
  <p class="mb-4 text-justify">
    3.1. Новое ТС передаётся Покупателю по Акту приёма-передачи. Сдаваемое ТС передаётся Продавцу одновременно с подписанием настоящего договора вместе с ПТС, СТС и ключами.
  </p>
  <p class="mb-4 text-justify">
    3.2. Право собственности на транспортные средства переходит к сторонам с момента подписания актов приёма-передачи.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    4.1. Стороны несут ответственность в соответствии с законодательством РФ. Покупатель гарантирует, что Сдаваемое ТС свободно от прав третьих лиц.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении.
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
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{seller_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">В лице: {{{seller_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>
`,
  },
{
    id: "car-commission",
    name: "Договор комиссии на продажу автомобиля",
    category: "auto",
    actSource: "ст. 990 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор комиссии: комиссионер продаёт автомобиль комитента за вознаграждение. Подходит для продажи авто через салоны и посредников.",
    suggestedDocs: ["act-transfer-auto", "raspiska-money", "commission-sale"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "principal_fio", label: "ФИО Комитента", type: "text", defaultValue: "", category: "owner", validation: { required: true } },
      { id: "principal_passport", label: "Паспорт комитента", type: "text", defaultValue: "", category: "owner" },
      { id: "principal_address", label: "Адрес комитента", type: "text", defaultValue: "", category: "owner" },
      { id: "agent_company", label: "Название Комиссионера", type: "text", defaultValue: "", category: "representative" },
      { id: "agent_inn", label: "ИНН комиссионера", type: "text", defaultValue: "", category: "representative" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "min_price", label: "Минимальная цена продажи (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "commission_pct", label: "Вознаграждение комиссионера (% от цены)", type: "number", defaultValue: "", category: "contract" },
      { id: "valid_until", label: "Срок действия договора", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `

<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор комиссии на продажу автомобиля</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{principal_fio}}}</strong> (паспорт {{{principal_passport}}}, адрес: {{{principal_address}}}), именуемый в дальнейшем «Комитент», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{agent_company}}}</strong> (ИНН {{{agent_inn}}}), именуемый в дальнейшем «Комиссионер», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Комиссионер обязуется по поручению Комитента за вознаграждение совершить от своего имени сделку по продаже автомобиля {{{car_brand}}}, VIN {{{car_vin}}}, гос. номер {{{car_plate}}} (далее — ТС).
  </p>
  <p class="mb-4 text-justify">
    1.2. Минимальная цена продажи ТС составляет <strong>{{{min_price}}} рублей</strong>. Продажа ниже указанной цены допускается только с письменного согласия Комитента.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Вознаграждение</div>
  <p class="mb-4 text-justify">
    2.1. Вознаграждение Комиссионера составляет {{{commission_pct}}}% от цены продажи ТС и выплачивается после заключения договора купли-продажи с покупателем.
  </p>
  <p class="mb-4 text-justify">
    2.2. Сумма, вырученная от продажи, за вычетом вознаграждения, передаётся Комитенту в течение 3 рабочих дней с момента получения.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности сторон</div>
  <p class="mb-4 text-justify">
    3.1. Комиссионер обязан исполнить поручение на наиболее выгодных для Комитента условиях, предоставить отчёт о выполнении поручения.
  </p>
  <p class="mb-4 text-justify">
    3.2. Комитент обязуется передать ТС и документы на него Комиссионеру и уплатить вознаграждение.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    4.1. Комиссионер отвечает за утрату и повреждение ТС, находящегося у него, в соответствии со ст. 998 ГК РФ.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении.
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
      <div class="font-bold mb-2 uppercase text-black">Комитент:</div>
      <p class="mb-1"><strong>{{{principal_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{principal_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{principal_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Комиссионер:</div>
      <p class="mb-1"><strong>{{{agent_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{agent_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">В лице: {{{agent_company}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>
`,
  },
{
    id: "dkp-truck",
    name: "Договор купли-продажи грузового автомобиля",
    category: "auto",
    actSource: "ст. 454 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи грузового автомобиля (тягача, фургона, самосвала) между физическими лицами.",
    suggestedDocs: ["act-transfer-auto","raspiska-money","gibdd-reg-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4 с двух сторон",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "seller_address", label: "Адрес продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "buyer_address", label: "Адрес покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "truck_brand", label: "Марка и модель", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "truck_year", label: "Год выпуска", type: "number", defaultValue: "", category: "vehicle" },
      { id: "truck_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "truck_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "truck_mileage", label: "Пробег (км)", type: "number", defaultValue: "", category: "vehicle" },
      { id: "contract_price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи грузового автомобиля</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_address}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_address}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Продавец передаёт в собственность Покупателя, а Покупатель принимает и оплачивает грузовой автомобиль: <strong>{{{truck_brand}}}</strong>, {{{truck_year}}} года выпуска, VIN <strong>{{{truck_vin}}}</strong>, гос. номер {{{truck_plate}}}, пробег {{{truck_mileage}}} км.</p>
  <p class="mb-4 text-justify">1.2. Продавец гарантирует, что автомобиль не находится в залоге, под арестом, не обременён правами третьих лиц.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость автомобиля составляет <strong>{{{contract_price}}} рублей</strong> (прописью: {{{contract_price_words}}}).</p>
  <p class="mb-4 text-justify">2.2. Покупатель оплачивает стоимость при подписании настоящего договора. Передача денежных средств подтверждается распиской.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача автомобиля</div>
  <p class="mb-4 text-justify">3.1. Автомобиль передаётся по Акту приёма-передачи вместе с ПТС, СТС и комплектом ключей в день подписания договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. В случае изъятия автомобиля у Покупателя третьими лицами Продавец обязан возместить понесённые убытки.</p>

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
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "dkp-bus",
    name: "Договор купли-продажи автобуса",
    category: "auto",
    actSource: "ст. 454 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи автобуса или микроавтобуса между физическими лицами.",
    suggestedDocs: ["act-transfer-auto","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "seller_address", label: "Адрес продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "buyer_address", label: "Адрес покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "bus_brand", label: "Марка и модель", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "bus_year", label: "Год выпуска", type: "number", defaultValue: "", category: "vehicle" },
      { id: "bus_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "bus_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "bus_seats", label: "Количество мест", type: "number", defaultValue: "", category: "vehicle" },
      { id: "contract_price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи автобуса</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_address}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_address}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Продавец передаёт в собственность Покупателя, а Покупатель принимает и оплачивает автобус: <strong>{{{bus_brand}}}</strong>, {{{bus_year}}} года выпуска, VIN <strong>{{{bus_vin}}}</strong>, гос. номер {{{bus_plate}}}, количество мест {{{bus_seats}}}.</p>
  <p class="mb-4 text-justify">1.2. Продавец гарантирует, что автобус не находится в залоге, под арестом, не обременён правами третьих лиц.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость автобуса составляет <strong>{{{contract_price}}} рублей</strong> (прописью: {{{contract_price_words}}}).</p>
  <p class="mb-4 text-justify">2.2. Покупатель оплачивает стоимость при подписании настоящего договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача автобуса</div>
  <p class="mb-4 text-justify">3.1. Автобус передаётся по Акту приёма-передачи вместе с ПТС, СТС и комплектом ключей.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. Стороны несут ответственность за неисполнение условий настоящего договора в соответствии с законодательством РФ.</p>

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
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "dkp-watercraft",
    name: "Договор купли-продажи гидроцикла",
    category: "auto",
    actSource: "ст. 454 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи гидроцикла или маломерного судна, подлежащего регистрации в ГИМС.",
    suggestedDocs: ["act-transfer-auto","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "seller_address", label: "Адрес продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "buyer_address", label: "Адрес покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "wc_brand", label: "Марка и модель", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "wc_year", label: "Год выпуска", type: "number", defaultValue: "", category: "vehicle" },
      { id: "wc_vin", label: "Идентификационный номер (HIN)", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "wc_engine", label: "Номер двигателя", type: "text", defaultValue: "", category: "vehicle" },
      { id: "wc_number", label: "Бортовой номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "contract_price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи гидроцикла (маломерного судна)</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_address}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_address}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Продавец передаёт в собственность Покупателя, а Покупатель принимает и оплачивает гидроцикл: <strong>{{{wc_brand}}}</strong>, {{{wc_year}}} года выпуска, идентификационный номер (HIN) {{{wc_vin}}}, номер двигателя {{{wc_engine}}}, бортовой номер {{{wc_number}}}.</p>
  <p class="mb-4 text-justify">1.2. Продавец гарантирует, что гидроцикл не находится в залоге, под арестом, не обременён правами третьих лиц.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость гидроцикла составляет <strong>{{{contract_price}}} рублей</strong> (прописью: {{{contract_price_words}}}).</p>
  <p class="mb-4 text-justify">2.2. Оплата производится при подписании настоящего договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача гидроцикла</div>
  <p class="mb-4 text-justify">3.1. Гидроцикл передаётся по Акту приёма-передачи вместе с судовым билетом и ключами. Регистрация перехода права осуществляется в ГИМС.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. Стороны несут ответственность в соответствии с законодательством РФ.</p>

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
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "taxi-lease",
    name: "Договор аренды автомобиля под такси",
    category: "auto",
    actSource: "ст. 642 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор аренды автомобиля без экипажа для работы в такси с указанием требований к водителю и лицензии.",
    suggestedDocs: ["act-transfer-auto","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "lessor_fio", label: "ФИО Арендодателя", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "lessor_passport", label: "Паспорт арендодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "lessor_address", label: "Адрес арендодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "tenant_fio", label: "ФИО Арендатора", type: "text", defaultValue: "", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Паспорт арендатора", type: "text", defaultValue: "", category: "tenant" },
      { id: "tenant_address", label: "Адрес арендатора", type: "text", defaultValue: "", category: "tenant" },
      { id: "tenant_license", label: "Разрешение на такси (номер)", type: "text", defaultValue: "", category: "tenant" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "rent_amount", label: "Стоимость аренды (руб./сутки)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "rent_start", label: "Дата начала аренды", type: "date", defaultValue: "", category: "contract" },
      { id: "rent_end", label: "Дата окончания аренды", type: "date", defaultValue: "", category: "contract" },
      { id: "fuel_note", label: "Кто оплачивает топливо", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды автомобиля для работы в такси</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lessor_fio}}}</strong> (паспорт {{{lessor_passport}}}, адрес: {{{lessor_address}}}), именуемый в дальнейшем «Арендодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{tenant_fio}}}</strong> (паспорт {{{tenant_passport}}}, адрес: {{{tenant_address}}}), именуемый в дальнейшем «Арендатор», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Арендодатель передаёт Арендатору во временное владение и пользование автомобиль <strong>{{{car_brand}}}</strong>, VIN {{{car_vin}}}, гос. номер {{{car_plate}}}, для использования в качестве легкового такси.</p>
  <p class="mb-4 text-justify">1.2. Арендатор имеет разрешение на осуществление деятельности такси № {{{tenant_license}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость аренды составляет <strong>{{{rent_amount}}} рублей</strong> в сутки и вносится ежедневно до начала смены.</p>
  <p class="mb-4 text-justify">2.2. Топливо оплачивает: {{{fuel_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок аренды</div>
  <p class="mb-4 text-justify">3.1. Срок аренды: с {{{rent_start}}} по {{{rent_end}}}. Договор может быть продлён по соглашению сторон.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности арендатора</div>
  <p class="mb-4 text-justify">4.1. Арендатор обязуется использовать автомобиль исключительно для перевозки пассажиров в рамках действующего законодательства о такси, поддерживать автомобиль в исправном состоянии.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За ущерб, причинённый автомобилю в период аренды, Арендатор возмещает стоимость ремонта. За нарушение сроков оплаты начисляется неустойка 1% от суммы долга за каждый день просрочки.</p>

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
      <p class="mb-1"><strong>{{{lessor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{lessor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lessor_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендатор:</div>
      <p class="mb-1"><strong>{{{tenant_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{tenant_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{tenant_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "car-leasing",
    name: "Договор лизинга автомобиля (физлицо)",
    category: "auto",
    actSource: "ст. 665 ГК РФ, ФЗ-164 «О финансовой аренде (лизинге)»",
    lastUpdated: "Август 2026",
    description: "Договор финансовой аренды (лизинга) легкового автомобиля для физического лица с правом выкупа.",
    suggestedDocs: ["act-transfer-auto","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "lessor_company", label: "Название лизинговой компании", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "lessor_inn", label: "ИНН лизингодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "lessor_address", label: "Адрес лизингодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "lessee_fio", label: "ФИО Лизингополучателя", type: "text", defaultValue: "", category: "tenant", validation: { required: true } },
      { id: "lessee_passport", label: "Паспорт лизингополучателя", type: "text", defaultValue: "", category: "tenant" },
      { id: "lessee_address", label: "Адрес лизингополучателя", type: "text", defaultValue: "", category: "tenant" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "car_price", label: "Стоимость ТС (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "advance_payment", label: "Авансовый платёж (руб.)", type: "number", defaultValue: "", category: "contract" },
      { id: "monthly_payment", label: "Ежемесячный платёж (руб.)", type: "number", defaultValue: "", category: "contract" },
      { id: "lease_term", label: "Срок лизинга (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "buyout_price", label: "Выкупная стоимость (руб.)", type: "number", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор лизинга (финансовой аренды) автомобиля</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{lessor_company}}}</strong> (ИНН {{{lessor_inn}}}, адрес: {{{lessor_address}}}), именуемое в дальнейшем «Лизингодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lessee_fio}}}</strong> (паспорт {{{lessee_passport}}}, адрес: {{{lessee_address}}}), именуемый в дальнейшем «Лизингополучатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Лизингодатель обязуется приобрести в собственность и передать Лизингополучателю во временное владение и пользование автомобиль <strong>{{{car_brand}}}</strong>, VIN {{{car_vin}}}, гос. номер {{{car_plate}}} (далее — ТС), стоимостью <strong>{{{car_price}}} рублей</strong>.</p>
  <p class="mb-4 text-justify">1.2. ТС передаётся по Акту приёма-передачи и является предметом лизинга на весь срок действия договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Лизинговые платежи</div>
  <p class="mb-4 text-justify">2.1. Авансовый платёж — {{{advance_payment}}} рублей, вносится до передачи ТС.</p>
  <p class="mb-4 text-justify">2.2. Ежемесячный лизинговый платёж — <strong>{{{monthly_payment}}} рублей</strong>, уплачивается не позднее 5-го числа каждого месяца.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок лизинга и выкуп</div>
  <p class="mb-4 text-justify">3.1. Срок лизинга — {{{lease_term}}} месяцев.</p>
  <p class="mb-4 text-justify">3.2. После полной уплаты лизинговых платежей и выкупной стоимости {{{buyout_price}}} рублей ТС переходит в собственность Лизингополучателя.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности лизингополучателя</div>
  <p class="mb-4 text-justify">4.1. Лизингополучатель обязуется своевременно вносить платежи, страховать ТС (ОСАГО, КАСКО), нести расходы на содержание и ремонт, не передавать ТС третьим лицам.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За просрочку платежей начисляется неустойка 0,1% от суммы задолженности за каждый день просрочки. При неоплате двух платежей подряд Лизингодатель вправе расторгнуть договор и изъять ТС.</p>

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
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lessor_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Лизингополучатель:</div>
      <p class="mb-1"><strong>{{{lessee_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{lessee_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lessee_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "car-relocation",
    name: "Договор на перегон автомобиля",
    category: "auto",
    actSource: "ст. 779 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор оказания услуг по перегону (доставке) автомобиля из другого города. Ответственность перегонщика за сохранность ТС.",
    suggestedDocs: ["act-transfer-auto","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_fio", label: "ФИО Заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "customer_address", label: "Адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "driver_fio", label: "ФИО Исполнителя (перегонщика)", type: "text", defaultValue: "", category: "driver", validation: { required: true } },
      { id: "driver_passport", label: "Паспорт исполнителя", type: "text", defaultValue: "", category: "driver" },
      { id: "driver_address", label: "Адрес исполнителя", type: "text", defaultValue: "", category: "driver" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "route_from", label: "Откуда перегон", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "route_to", label: "Куда перегон", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "service_price", label: "Стоимость услуг (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "delivery_date", label: "Срок доставки (дата)", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на перегон автомобиля</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{customer_fio}}}</strong> (паспорт {{{customer_passport}}}, адрес: {{{customer_address}}}), именуемый в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{driver_fio}}}</strong> (паспорт {{{driver_passport}}}, адрес: {{{driver_address}}}), именуемый в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется по поручению Заказчика осуществить перегон автомобиля <strong>{{{car_brand}}}</strong>, VIN {{{car_vin}}}, гос. номер {{{car_plate}}} по маршруту: {{{route_from}}} — {{{route_to}}}.</p>
  <p class="mb-4 text-justify">1.2. Срок доставки: {{{delivery_date}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость услуг</div>
  <p class="mb-4 text-justify">2.1. Стоимость услуг составляет <strong>{{{service_price}}} рублей</strong> и включает расходы на топливо.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится по прибытии автомобиля в пункт назначения.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности исполнителя</div>
  <p class="mb-4 text-justify">3.1. Исполнитель обязуется обеспечить сохранность автомобиля, соблюдать ПДД, не использовать автомобиль в личных целях.</p>
  <p class="mb-4 text-justify">3.2. При нарушении ПДД в пути следования штрафы и их оплата возлагаются на Исполнителя.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. За повреждение автомобиля в пути Исполнитель возмещает стоимость ремонта. За просрочку доставки Заказчик вправе требовать неустойку 1% от стоимости услуг за каждый день просрочки.</p>

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
      <p class="mb-1"><strong>{{{customer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{customer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{driver_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{driver_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{driver_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "spouse-consent-car-sale",
    name: "Согласие супруга на продажу автомобиля",
    category: "auto",
    actSource: "ст. 35 Семейного кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Нотариальное согласие супруга(и) на продажу автомобиля, приобретённого в браке. Требуется для сделок с ТС, находящимся в совместной собственности.",
    suggestedDocs: ["dkp-auto","dkp-truck"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "spouse_fio", label: "ФИО супруга(и)", type: "text", defaultValue: "", category: "spouse", validation: { required: true } },
      { id: "spouse_passport", label: "Паспорт супруга(и)", type: "text", defaultValue: "", category: "spouse" },
      { id: "spouse_address", label: "Адрес супруга(и)", type: "text", defaultValue: "", category: "spouse" },
      { id: "owner_fio", label: "ФИО супруга (собственника)", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "price_note", label: "Цена продажи (руб.)", type: "number", defaultValue: "", category: "contract" },
      { id: "marriage_cert", label: "Свидетельство о браке (серия №)", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Согласие супруга на продажу автомобиля</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{spouse_fio}}}</strong> (паспорт {{{spouse_passport}}}, адрес: {{{spouse_address}}}), именуемый в дальнейшем «Дающий согласие», с одной стороны,
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Согласие</div>
  <p class="mb-4 text-justify">1.1. Я, {{{spouse_fio}}}, состоящий(ая) в браке с {{{owner_fio}}} (свидетельство о браке {{{marriage_cert}}}), настоящим даю согласие на продажу автомобиля <strong>{{{car_brand}}}</strong>, VIN {{{car_vin}}}, гос. номер {{{car_plate}}}, являющегося совместной собственностью супругов, по цене {{{price_note}}} рублей на условиях по усмотрению собственника.</p>
  <p class="mb-4 text-justify">1.2. Настоящее согласие выдано для предъявления в органы ГИБДД и иные инстанции и действительно в течение 6 (шести) месяцев со дня его подписания.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Подтверждение</div>
  <p class="mb-4 text-justify">2.1. Подтверждаю, что моя воля на дачу согласия выражена свободно, без принуждения, последствия сделки мне разъяснены.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">3. Форс-мажор</div>
  <p class="mb-4 text-justify">3.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">3.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">3.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">4.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">4.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Дающий согласие:</div>
      <p class="mb-1"><strong>{{{spouse_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{spouse_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{spouse_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "car-warranty-order",
    name: "Заказ-наряд на ремонт автомобиля (СТО)",
    category: "auto",
    actSource: "ст. 730 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Заказ-наряд на техническое обслуживание и ремонт автомобиля в автосервисе — первичный документ приёмки ТС в ремонт.",
    suggestedDocs: ["car-repair","act-works","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "order_number", label: "Номер заказ-наряда", type: "number", defaultValue: "", category: "contract" },
      { id: "customer_fio", label: "ФИО Заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "customer_address", label: "Адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Название СТО", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН СТО", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_address", label: "Адрес СТО", type: "text", defaultValue: "", category: "executor" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "car_mileage", label: "Пробег (км)", type: "number", defaultValue: "", category: "vehicle" },
      { id: "work_description", label: "Перечень работ", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "parts_note", label: "Запчасти и материалы", type: "textarea", defaultValue: "", category: "contract" },
      { id: "total_price", label: "Итоговая стоимость (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "deadline", label: "Срок готовности (дата)", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заказ-наряд на ремонт автомобиля № {{{order_number}}}</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{customer_fio}}}</strong> (паспорт {{{customer_passport}}}, адрес: {{{customer_address}}}), именуемый в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_address}}}), именуемое в дальнейшем «Исполнитель (СТО)», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Принятые работы</div>
  <p class="mb-4 text-justify">1.1. Исполнитель принимает автомобиль <strong>{{{car_brand}}}</strong>, VIN {{{car_vin}}}, гос. номер {{{car_plate}}}, пробег {{{car_mileage}}} км, для выполнения работ: {{{work_description}}}.</p>
  <p class="mb-4 text-justify">1.2. Используемые запасные части и материалы: {{{parts_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и сроки</div>
  <p class="mb-4 text-justify">2.1. Итоговая стоимость работ и запчастей составляет <strong>{{{total_price}}} рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Срок готовности автомобиля: {{{deadline}}}. При невозможности выполнения работ в срок Исполнитель уведомляет Заказчика.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Гарантия</div>
  <p class="mb-4 text-justify">3.1. Гарантия на выполненные работы — 3 (три) месяца со дня выдачи автомобиля.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность</div>
  <p class="mb-4 text-justify">4.1. Исполнитель несёт ответственность за сохранность автомобиля и качество выполненных работ в соответствии с законодательством РФ.</p>

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
      <p class="mb-1"><strong>{{{customer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{customer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель (СТО):</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "car-selection",
    name: "Договор на подбор автомобиля (автоподбор)",
    category: "auto",
    actSource: "ст. 779 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор оказания услуг по подбору автомобиля с пробегом: проверка юридической чистоты, диагностика, торг с продавцом.",
    suggestedDocs: ["dkp-auto","act-transfer-auto"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_fio", label: "ФИО Заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "customer_address", label: "Адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "picker_fio", label: "ФИО Исполнителя (подборщик)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "picker_passport", label: "Паспорт исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "picker_address", label: "Адрес исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "car_budget", label: "Бюджет покупки (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "car_preferences", label: "Пожелания к автомобилю", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "service_price", label: "Стоимость услуг (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "term_days", label: "Срок подбора (дней)", type: "number", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание услуг по подбору автомобиля</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{customer_fio}}}</strong> (паспорт {{{customer_passport}}}, адрес: {{{customer_address}}}), именуемый в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{picker_fio}}}</strong> (паспорт {{{picker_passport}}}, адрес: {{{picker_address}}}), именуемый в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется по заданию Заказчика осуществить подбор автомобиля в соответствии с пожеланиями: {{{car_preferences}}}, в пределах бюджета {{{car_budget}}} рублей.</p>
  <p class="mb-4 text-justify">1.2. Услуги включают: поиск вариантов, проверку юридической чистоты (залог, аресты, ДТП, такси, лизинг), техническую диагностику, торг с продавцом, сопровождение сделки.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость услуг</div>
  <p class="mb-4 text-justify">2.1. Стоимость услуг составляет <strong>{{{service_price}}} рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится после подбора автомобиля и заключения договора купли-продажи.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок оказания услуг</div>
  <p class="mb-4 text-justify">3.1. Срок подбора — {{{term_days}}} дней с момента заключения договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность исполнителя</div>
  <p class="mb-4 text-justify">4.1. Исполнитель отвечает за достоверность предоставленной информации о проверках автомобиля. При выявлении обременений, скрытых от Заказчика, услуга подлежит повторному исполнению либо возврату оплаты.</p>

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
      <p class="mb-1"><strong>{{{customer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{customer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{picker_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{picker_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{picker_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "car-buyout",
    name: "Договор выкупа автомобиля (срочный выкуп)",
    category: "auto",
    actSource: "ст. 454 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор срочного выкупа автомобиля: владелец продаёт авто с дисконтом за скорость расчёта. Расчёт в день подписания.",
    suggestedDocs: ["act-transfer-auto","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "seller_address", label: "Адрес продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "ФИО Покупателя (выкупщик)", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "buyer_address", label: "Адрес покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "car_year", label: "Год выпуска", type: "number", defaultValue: "", category: "vehicle" },
      { id: "market_price", label: "Рыночная стоимость (руб.)", type: "number", defaultValue: "", category: "contract" },
      { id: "buyout_price", label: "Цена выкупа (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор выкупа автомобиля</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_address}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_address}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Продавец передаёт в собственность Покупателя автомобиль <strong>{{{car_brand}}}</strong>, {{{car_year}}} года выпуска, VIN {{{car_vin}}}, гос. номер {{{car_plate}}}.</p>
  <p class="mb-4 text-justify">1.2. Стороны подтверждают, что рыночная стоимость автомобиля составляет {{{market_price}}} рублей, а цена выкупа с учётом дисконта за срочность расчёта — <strong>{{{buyout_price}}} рублей</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Покупатель оплачивает {{{buyout_price}}} рублей в день подписания настоящего договора наличными. Передача денежных средств подтверждается распиской.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача автомобиля</div>
  <p class="mb-4 text-justify">3.1. Автомобиль, ПТС, СТС и комплект ключей передаются Покупателю одновременно с подписанием договора по Акту приёма-передачи.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. Продавец гарантирует, что автомобиль свободен от прав третьих лиц, не находится в залоге и под арестом.</p>

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
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "car-pledge",
    name: "Договор залога автомобиля",
    category: "auto",
    actSource: "ст. 334 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор залога транспортного средства в обеспечение обязательств по займу. Уведомление о залоге регистрируется в реестре ФНС.",
    suggestedDocs: ["loan-agreement","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "pledgor_fio", label: "ФИО Залогодателя", type: "text", defaultValue: "", category: "owner", validation: { required: true } },
      { id: "pledgor_passport", label: "Паспорт залогодателя", type: "text", defaultValue: "", category: "owner" },
      { id: "pledgor_address", label: "Адрес залогодателя", type: "text", defaultValue: "", category: "owner" },
      { id: "pledgee_fio", label: "ФИО Залогодержателя", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "pledgee_passport", label: "Паспорт залогодержателя", type: "text", defaultValue: "", category: "recipient" },
      { id: "pledgee_address", label: "Адрес залогодержателя", type: "text", defaultValue: "", category: "recipient" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "debt_amount", label: "Обеспечиваемое обязательство (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "loan_term", label: "Срок возврата займа (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "pledge_value", label: "Оценочная стоимость ТС (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "storage_note", label: "Где хранится ТС", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор залога транспортного средства</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{pledgor_fio}}}</strong> (паспорт {{{pledgor_passport}}}, адрес: {{{pledgor_address}}}), именуемый в дальнейшем «Залогодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{pledgee_fio}}}</strong> (паспорт {{{pledgee_passport}}}, адрес: {{{pledgee_address}}}), именуемый в дальнейшем «Залогодержатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. В обеспечение исполнения обязательств по договору займа на сумму <strong>{{{debt_amount}}} рублей</strong> со сроком возврата {{{loan_term}}} Залогодатель передаёт в залог Залогодержателю автомобиль <strong>{{{car_brand}}}</strong>, VIN {{{car_vin}}}, гос. номер {{{car_plate}}}, оценочной стоимостью <strong>{{{pledge_value}}} рублей</strong>.</p>
  <p class="mb-4 text-justify">1.2. Предмет залога остаётся у Залогодателя: {{{storage_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Обязанности залогодателя</div>
  <p class="mb-4 text-justify">2.1. Залогодатель обязуется не отчуждать предмет залога без согласия Залогодержателя, страховать его, поддерживать в исправном состоянии, не передавать третьим лицам.</p>
  <p class="mb-4 text-justify">2.2. Залогодатель обязан уведомить Залогодержателя о возникновении угрозы утраты или повреждения предмета залога.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обращение взыскания</div>
  <p class="mb-4 text-justify">3.1. При неисполнении обеспеченного залогом обязательства Залогодержатель вправе обратить взыскание на предмет залога в порядке, установленном ст. 348–350 ГК РФ.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. Стороны несут ответственность в соответствии с законодательством РФ. Уведомление о залоге подлежит регистрации в реестре уведомлений ФНС России.</p>

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
      <p class="text-zinc-500 text-[11px]">Адрес: {{{pledgor_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Залогодержатель:</div>
      <p class="mb-1"><strong>{{{pledgee_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{pledgee_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{pledgee_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "dkp-moped",
    name: "Договор купли-продажи мопеда (скутера)",
    category: "auto",
    actSource: "ст. 454 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи мопеда, скутера или электроскутера между физическими лицами.",
    suggestedDocs: ["raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "seller_address", label: "Адрес продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "buyer_address", label: "Адрес покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "moped_brand", label: "Марка и модель", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "moped_year", label: "Год выпуска", type: "number", defaultValue: "", category: "vehicle" },
      { id: "moped_vin", label: "Номер рамы", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "moped_mileage", label: "Пробег (км)", type: "number", defaultValue: "", category: "vehicle" },
      { id: "contract_price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи мопеда (скутера)</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_address}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_address}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Продавец передаёт в собственность Покупателя, а Покупатель принимает и оплачивает мопед (скутер): <strong>{{{moped_brand}}}</strong>, {{{moped_year}}} года выпуска, номер рамы {{{moped_vin}}}, пробег {{{moped_mileage}}} км.</p>
  <p class="mb-4 text-justify">1.2. Продавец гарантирует отсутствие прав третьих лиц на указанное ТС.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость составляет <strong>{{{contract_price}}} рублей</strong> (прописью: {{{contract_price_words}}}).</p>
  <p class="mb-4 text-justify">2.2. Оплата производится при подписании настоящего договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача ТС</div>
  <p class="mb-4 text-justify">3.1. Мопед передаётся Покупателю вместе с документами и ключами в день подписания договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. Стороны несут ответственность в соответствии с законодательством РФ.</p>

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
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "car-insurance-claim",
    name: "Заявление о страховой выплате (ОСАГО/КАСКО)",
    category: "auto",
    actSource: "ст. 11 ФЗ-40 «Об ОСАГО», ст. 961 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Заявление в страховую компанию о наступлении страхового случая по ОСАГО или КАСКО (ДТП, ущерб, угон).",
    suggestedDocs: ["spravka-gibdd"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "ins_company", label: "Название страховой компании", type: "text", defaultValue: "", category: "insurance", validation: { required: true } },
      { id: "ins_branch", label: "Адрес отделения", type: "text", defaultValue: "", category: "insurance" },
      { id: "fio", label: "ФИО заявителя", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant" },
      { id: "address", label: "Адрес", type: "text", defaultValue: "", category: "applicant" },
      { id: "phone", label: "Телефон", type: "text", defaultValue: "", category: "applicant" },
      { id: "policy_number", label: "Номер полиса", type: "text", defaultValue: "", category: "insurance" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "event_date", label: "Дата страхового случая", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "event_place", label: "Место страхового случая", type: "text", defaultValue: "", category: "contract" },
      { id: "event_desc", label: "Обстоятельства случая", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "damage_note", label: "Повреждения ТС", type: "textarea", defaultValue: "", category: "contract" },
      { id: "documents_list", label: "Прилагаемые документы", type: "textarea", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о наступлении страхового случая</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Прошу произвести страховую выплату (организовать ремонт) по страховому случаю, произошедшему {{{event_date}}} в {{{event_place}}}: {{{event_desc}}}.</p>
  <p class="mb-4 text-justify">1.2. Транспортное средство: <strong>{{{car_brand}}}</strong>, гос. номер {{{car_plate}}}, повреждения: {{{damage_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Документы</div>
  <p class="mb-4 text-justify">2.1. К заявлению прилагаю: {{{documents_list}}}.</p>

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
      <p class="mb-1"><strong>{{{fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{address}}}</p>
      <p class="text-zinc-500 text-[11px]">Телефон: {{{phone}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "car-detailing",
    name: "Договор на детейлинг (мойку) автомобиля",
    category: "auto",
    actSource: "ст. 779 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор на оказание услуг по детейлингу: мойка, полировка, химчистка, нанесение защитных покрытий.",
    suggestedDocs: ["act-works","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_fio", label: "ФИО Заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "customer_address", label: "Адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Название исполнителя", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_address", label: "Адрес исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "service_list", label: "Перечень услуг", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "service_price", label: "Стоимость услуг (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "deadline", label: "Срок выполнения (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "warranty_note", label: "Гарантия на услуги", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание услуг по детейлингу автомобиля</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{customer_fio}}}</strong> (паспорт {{{customer_passport}}}, адрес: {{{customer_address}}}), именуемый в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_address}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется оказать Заказчику услуги по детейлингу автомобиля <strong>{{{car_brand}}}</strong>, гос. номер {{{car_plate}}}: {{{service_list}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и сроки</div>
  <p class="mb-4 text-justify">2.1. Стоимость услуг составляет <strong>{{{service_price}}} рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Срок оказания услуг: {{{deadline}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Гарантия</div>
  <p class="mb-4 text-justify">3.1. Гарантия на выполненные работы: {{{warranty_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. Исполнитель несёт ответственность за сохранность автомобиля и качество оказанных услуг.</p>

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
      <p class="mb-1"><strong>{{{customer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{customer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "car-equipment-install",
    name: "Договор на установку дополнительного оборудования",
    category: "auto",
    actSource: "ст. 730 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description: "Договор на установку сигнализации, ГБО, тонировки, фаркопа и другого дополнительного оборудования на автомобиль.",
    suggestedDocs: ["car-repair","act-works"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_fio", label: "ФИО Заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "customer_address", label: "Адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Название исполнителя", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_address", label: "Адрес исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_plate", label: "Гос. номер", type: "text", defaultValue: "", category: "vehicle" },
      { id: "equipment_list", label: "Перечень оборудования и работ", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "equipment_price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "warranty_months", label: "Гарантия (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "deadline", label: "Срок выполнения (дата)", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на установку дополнительного оборудования на автомобиль</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{customer_fio}}}</strong> (паспорт {{{customer_passport}}}, адрес: {{{customer_address}}}), именуемый в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_address}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется установить на автомобиль <strong>{{{car_brand}}}</strong>, гос. номер {{{car_plate}}} следующее оборудование: {{{equipment_list}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и сроки</div>
  <p class="mb-4 text-justify">2.1. Стоимость работ и оборудования составляет <strong>{{{equipment_price}}} рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Срок выполнения: {{{deadline}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Гарантия</div>
  <p class="mb-4 text-justify">3.1. Гарантия на установленное оборудование и работы — {{{warranty_months}}} месяцев.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность</div>
  <p class="mb-4 text-justify">4.1. Исполнитель несёт ответственность за качество установки и сохранность автомобиля.</p>

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
      <p class="mb-1"><strong>{{{customer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{customer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "auto-condition-act",
    name: "Акт осмотра технического состояния автомобиля",
    category: "auto",
    actSource: "ст. 456, 469 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Акт осмотра автомобиля при покупке б/у: фиксация пробега, кузова, двигателя, комплектации, дефектов и комплектности.",
    suggestedDocs: ["dkp-auto","act-transfer-auto"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_addr", label: "Адрес продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "ФИО покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_addr", label: "Адрес покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "car", label: "Автомобиль", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "mileage", label: "Пробег (км)", type: "number", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "sts", label: "СТС", type: "text", defaultValue: "", category: "sts", validation: { required: true } },
      { id: "pts", label: "ПТС", type: "text", defaultValue: "", category: "pts", validation: { required: true } },
      { id: "body_state", label: "Состояние кузова", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "engine_state", label: "Состояние двигателя", type: "text", defaultValue: "", category: "vehicle" },
      { id: "defects", label: "Выявленные дефекты", type: "textarea", defaultValue: "", category: "vehicle" },
      { id: "complete_set", label: "Комплектность", type: "text", defaultValue: "", category: "vehicle" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Акт осмотра технического состояния автомобиля</div>
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
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие сведения</div>
  <p class="mb-4 text-justify">1.1. Произведён осмотр автомобиля: {{{car}}}, пробег {{{mileage}}} км.</p>
  <p class="mb-4 text-justify">1.2. Документы: ПТС {{{pts}}}, СТС {{{sts}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Состояние автомобиля</div>
  <p class="mb-4 text-justify">2.1. Кузов: {{{body_state}}}.</p>
  <p class="mb-4 text-justify">2.2. Двигатель: {{{engine_state}}}.</p>
  <p class="mb-4 text-justify">2.3. Комплектность: {{{complete_set}}}.</p>
  <p class="mb-4 text-justify">2.4. Выявленные дефекты: {{{defects}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Результаты осмотра</div>
  <p class="mb-4 text-justify">3.1. Покупатель с техническим состоянием автомобиля ознакомлен, претензий не имеет (имеет).</p>
  <p class="mb-4 text-justify">3.2. Настоящий акт является основанием для подписания договора купли-продажи.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
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
    id: "dkp-auto-short",
    name: "ДКП авто — Краткий (1 стр.)",
    category: "auto",
    actSource: "ст. 454 Гражданского кодекса РФ",
    lastUpdated: "Август 2026",
    description:
      "Краткая форма договора купли-продажи автомобиля на одной странице. Содержит только обязательные сведения: стороны, транспортное средство и цену.",
    suggestedDocs: ["act-transfer-auto", "raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печатается на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", placeholder: "4512 123456", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_address", label: "Адрес регистрации продавца", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", placeholder: "4615 987654", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_address", label: "Адрес регистрации покупателя", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "car_brand", label: "Марка и модель ТС", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_year", label: "Год выпуска ТС", type: "number", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "car_vin", label: "VIN номер ТС", type: "text", placeholder: "17 символов", defaultValue: "", category: "vehicle", validation: { minLength: 17, maxLength: 17, required: true } },
      { id: "car_plate", label: "Гос. регистрационный знак", type: "text", defaultValue: "", category: "vehicle" },
      { id: "car_color", label: "Цвет ТС", type: "text", defaultValue: "", category: "vehicle" },
      { id: "car_pts", label: "ПТС (серия, номер)", type: "text", defaultValue: "", category: "pts" },
      { id: "car_sts", label: "СТС (серия, номер)", type: "text", defaultValue: "", category: "sts", validation: { required: true } },
      { id: "contract_price", label: "Стоимость ТС (суммой)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[20mm] pr-[15mm] pt-[20mm] pb-[20mm] font-serif text-base leading-normal text-zinc-900 bg-white">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="doc-title text-center font-bold text-base uppercase mb-2">Договор купли-продажи транспортного средства</div>
  <div class="text-center text-xs mb-6">№ {{{car_plate}}}</div>
  <div class="border-b border-zinc-300 mb-6"></div>

  <div class="doc-sides grid grid-cols-2 gap-6 mb-6">
    <div>
      <div class="doc-sides-title">Продавец</div>
      <p class="mb-1 text-sm"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-xs mb-0.5">Паспорт: {{{seller_passport}}}</p>
      <p class="text-xs mb-0.5">Адрес: {{{seller_address}}}</p>
    </div>
    <div>
      <div class="doc-sides-title">Покупатель</div>
      <p class="mb-1 text-sm"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-xs mb-0.5">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-xs mb-0.5">Адрес: {{{buyer_address}}}</p>
    </div>
  </div>

  <p class="mb-4 text-justify">
    Продавец передает в собственность Покупателю, а Покупатель принимает и оплачивает транспортное средство:
  </p>

  <table class="w-full border-collapse mb-4 text-xs">
    <tr><th class="border border-zinc-400 p-1 text-left">Марка, модель</th><td class="border border-zinc-400 p-1">{{{car_brand}}}</td></tr>
    <tr><th class="border border-zinc-400 p-1 text-left">Год выпуска</th><td class="border border-zinc-400 p-1">{{{car_year}}}</td></tr>
    <tr><th class="border border-zinc-400 p-1 text-left">Идентификационный номер (VIN)</th><td class="border border-zinc-400 p-1">{{{car_vin}}}</td></tr>
    <tr><th class="border border-zinc-400 p-1 text-left">Государственный регистрационный знак</th><td class="border border-zinc-400 p-1">{{{car_plate}}}</td></tr>
    <tr><th class="border border-zinc-400 p-1 text-left">Цвет</th><td class="border border-zinc-400 p-1">{{{car_color}}}</td></tr>
    {{#car_pts}}<tr><th class="border border-zinc-400 p-1 text-left">Паспорт ТС (ПТС)</th><td class="border border-zinc-400 p-1">{{{car_pts}}}</td></tr>{{/car_pts}}
    <tr><th class="border border-zinc-400 p-1 text-left">Свидетельство о регистрации (СТС)</th><td class="border border-zinc-400 p-1">{{{car_sts}}}</td></tr>
  </table>

  <div class="doc-price mb-4">
    <p class="text-sm">Цена договора: <strong>{{{contract_price}}} рублей</strong></p>
    <p class="text-xs text-zinc-600">(прописью: <em>{{{contract_price_words}}}</em>)</p>
  </div>

  <p class="mb-4 text-justify text-xs">
    Продавец гарантирует, что Транспортное средство не находится в залоге, под арестом, не обременено правами третьих лиц. Деньги за ТС переданы Продавцу полностью при подписании настоящего договора. Настоящий договор составлен в двух экземплярах, имеющих равную юридическую силу.
  </p>

  <div class="grid grid-cols-2 gap-6 mt-8 text-xs">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись Продавца</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись Покупателя</div>
    </div>
  </div>
</div>`,
  }
];
