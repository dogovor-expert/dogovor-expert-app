import type { LegalTemplate } from "../types";

export const TEMPLATES_MIGRATION: LegalTemplate[] = [
{
    id: "visa-invitation",
    name: "Визовое приглашение для иностранного гражданина",
    category: "migration",
    actSource: "ФЗ-114 «О порядке выезда из РФ и въезда в РФ»",
    lastUpdated: "Август 2026",
    description:
      "Приглашение на въезд иностранного гражданина в РФ: приглашающая сторона, данные гостя, цель и сроки поездки.",
    suggestedDocs: ["passport-intl-app"],
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата приглашения", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "host_company", label: "Приглашающая организация", type: "text",
        defaultValue: "", category: "business",
      },
      {
        id: "host_inn", label: "ИНН организации", type: "text", defaultValue: "",
        category: "business",
      },
      {
        id: "host_address", label: "Юридический адрес организации", type: "text",
        defaultValue: "", category: "business",
      },
      {
        id: "guest_fio", label: "ФИО приглашаемого (лат.)", type: "text", defaultValue: "",
        category: "applicant", validation: { required: true },
      },
      {
        id: "guest_birthday", label: "Дата рождения гостя", type: "date", defaultValue: "",
        category: "applicant",
      },
      {
        id: "guest_passport", label: "Номер паспорта гостя", type: "text", defaultValue: "",
        category: "applicant",
      },
      {
        id: "guest_country", label: "Гражданство", type: "text", defaultValue: "", category: "applicant",
      },
      {
        id: "visit_purpose", label: "Цель поездки", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "visit_dates", label: "Период поездки", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "visa_type", label: "Тип запрашиваемой визы", type: "select", defaultValue: "Однократная деловая",
        category: "contract",
        options: [
          { label: "Однократная деловая", value: "однократная деловая" },
          { label: "Однократная туристическая", value: "однократная туристическая" },
          { label: "Рабочая", value: "рабочая" },
        ],
      },
      {
        id: "visa_days", label: "Срок визы (дней)", type: "number", defaultValue: "",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Приглашение на въезд в Российскую Федерацию</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Организация <strong>{{{host_company}}}</strong> (ИНН {{{host_inn}}}, юридический адрес: {{{host_address}}}), именуемая в дальнейшем «Приглашающая сторона», приглашает гражданина <strong>{{{guest_fio}}}</strong>, {{{guest_birthday}}} года рождения, паспорт № {{{guest_passport}}}, гражданство: {{{guest_country}}}, для въезда на территорию Российской Федерации.
  </p>
  <p class="mb-4 text-justify">
    Цель поездки: {{{visit_purpose}}}. Период поездки: {{{visit_dates}}}. Запрашивается {{{visa_type}}} виза сроком на {{{visa_days}}} дней.
  </p>
  <p class="mb-4 text-justify">
    Приглашающая сторона обязуется обеспечить своевременный выезд приглашаемого из РФ, его материальное, медицинское и жилищное обеспечение на период пребывания, а также нести все расходы, если иное не установлено законодательством.
  </p>
  <div class="mt-6 text-xs border-t border-zinc-300 pt-4">
    <div class="font-bold mb-1">Приглашающая сторона:</div>
    <p class="mb-1"><strong>{{{host_company}}}</strong></p>
    <div class="border-b border-zinc-950 w-56 h-5 mt-6"></div>
    <p class="text-xs mt-1">М.П. / подпись руководителя</p>
  </div>
</div>`,
  },
{
    id: "migration-notification",
    name: "Уведомление о прибытии иностранного гражданина (форма № 7)",
    category: "migration",
    actSource: "ФЗ-109 «О миграционном учёте», приказ МВД № 856",
    lastUpdated: "Август 2026",
    description: "Уведомление о прибытии иностранного гражданина в место пребывания (форма № 7): данные принимающей стороны и иностранца, миграционная карта, адрес пребывания. Срок подачи — 7 рабочих дней.",
    suggestedDocs: ["visa-invitation"],
    printInstruction: "Печать на листе А4; подаётся принимающей стороной в МВД, МФЦ или почтой в течение 7 рабочих дней со дня прибытия",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "", category: "contract" },
      { id: "host_fio", label: "Принимающая сторона (ФИО)", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "host_doc", label: "Документ принимающей стороны", type: "text", defaultValue: "", category: "applicant" },
      { id: "host_address", label: "Адрес принимающей стороны", type: "text", defaultValue: "", category: "applicant" },
      { id: "foreign_fio", label: "Иностранный гражданин (ФИО)", type: "text", defaultValue: "", category: "other", validation: { required: true } },
      { id: "foreign_birthday", label: "Дата рождения", type: "date", defaultValue: "", category: "other" },
      { id: "foreign_country", label: "Гражданство", type: "text", defaultValue: "", category: "other" },
      { id: "foreign_doc", label: "Документ, удостоверяющий личность", type: "text", defaultValue: "", category: "other" },
      { id: "migration_card", label: "Миграционная карта", type: "text", defaultValue: "", category: "other" },
      { id: "stay_address", label: "Адрес места пребывания", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "stay_term", label: "Срок пребывания (до)", type: "date", defaultValue: "", category: "contract" },
      { id: "purpose", label: "Цель визита", type: "select", defaultValue: "работа", category: "other", options: [
        { label: "Работа", value: "работа" },
        { label: "Туризм", value: "туризм" },
        { label: "Частная поездка", value: "частная поездка" },
        { label: "Учёба", value: "учёба" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-4 text-black uppercase">Уведомление о прибытии иностранного гражданина в место пребывания</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-3 text-justify">В орган миграционного учёта (МВД России / МФЦ)</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Сведения о принимающей стороне</div>
  <p class="mb-3 text-justify">{{{host_fio}}}, документ: {{{host_doc}}}, адрес: {{{host_address}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сведения об иностранном гражданине</div>
  <p class="mb-3 text-justify">{{{foreign_fio}}}, {{{foreign_birthday}}} г.р., гражданство: {{{foreign_country}}}. Документ: {{{foreign_doc}}}. Миграционная карта: {{{migration_card}}}. Цель визита: {{{purpose}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Место и срок пребывания</div>
  <p class="mb-3 text-justify">Адрес места пребывания: {{{stay_address}}}. Срок пребывания до «{{{stay_term}}}».</p>
  <p class="mb-3 text-justify">Уведомление подаётся не позднее 7 рабочих дней со дня прибытия (ст. 20-22 ФЗ-109).</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Принимающая сторона: {{{host_fio}}}</p>
    <div class="border-b border-zinc-950 w-56 h-5 mt-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
  </div>
</div>`,
  },
{
    id: "temp-registration-consent",
    name: "Согласие собственника на временную регистрацию",
    category: "migration",
    actSource: "ст. 80 ЖК РФ, Постановление Правительства РФ № 713, Приказ МВД России № 984",
    lastUpdated: "Август 2026",
    description: "Согласие собственника жилого помещения на временную регистрацию по месту пребывания: данные собственника и вселяемого, адрес, срок регистрации, основание права собственности.",
    suggestedDocs: ["migration-notification"],
    printInstruction: "Печать на листе А4; для регистрации согласие предоставляется вместе с уведомлением о прибытии в МВД (МФЦ)",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract" },
      { id: "owner_fio", label: "Собственник (ФИО)", type: "text", defaultValue: "", category: "owner", validation: { required: true } },
      { id: "owner_passport", label: "Паспорт собственника", type: "text", defaultValue: "", category: "owner" },
      { id: "owner_doc", label: "Правоустанавливающий документ", type: "text", defaultValue: "", category: "owner" },
      { id: "tenant_fio", label: "Вселяемое лицо (ФИО)", type: "text", defaultValue: "", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Паспорт вселяемого", type: "text", defaultValue: "", category: "tenant" },
      { id: "address", label: "Адрес жилого помещения", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "reg_start", label: "Срок регистрации с", type: "date", defaultValue: "", category: "contract" },
      { id: "reg_end", label: "Срок регистрации по", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Согласие собственника на регистрацию по месту пребывания</div>
  <p class="mb-4 text-justify">
    Я, <strong>{{{owner_fio}}}</strong>, паспорт: {{{owner_passport}}}, являясь собственником жилого помещения по адресу:
    <strong>{{{address}}}</strong> (право собственности подтверждено: {{{owner_doc}}}),
    в соответствии со ст. 80 ЖК РФ и п. 26 Правил регистрации и снятия граждан Российской Федерации с регистрационного учёта
    по месту пребывания и по месту жительства (утв. Постановлением Правительства РФ № 713) даю согласие на регистрацию
    по месту пребывания гражданина:
  </p>
  <p class="mb-3 text-justify">
    <strong>{{{tenant_fio}}}</strong>, паспорт: {{{tenant_passport}}},
    в указанном жилом помещении сроком с «{{{reg_start}}}» по «{{{reg_end}}}».
  </p>
  <p class="mb-3 text-justify">
    Настоящее согласие действительно при предъявлении паспорта собственника и действует на протяжении всего срока регистрации.
    Вселение не нарушает прав и законных интересов иных лиц, зарегистрированных в указанном жилом помещении.
  </p>
  <div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Собственник:</p>
      <p class="mb-6">{{{owner_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Согласен (вселяемое лицо):</p>
      <p class="mb-6">{{{tenant_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "temporary-residence-app",
    name: "Заявление о выдаче разрешения на временное проживание (РВП)",
    category: "migration",
    actSource: "ФЗ № 115-ФЗ «О правовом положении иностранных граждан»",
    lastUpdated: "Август 2026",
    description: "Заявление иностранного гражданина о выдаче разрешения на временное проживание в РФ (РВП) с указанием оснований.",
    suggestedDocs: ["visa-invitation","patent-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "applicant_birth", label: "Дата рождения", type: "date", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "birth_place", label: "Место рождения", type: "text", defaultValue: "", category: "applicant" },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "nationality", label: "Гражданство", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "purpose", label: "Цель въезда", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "arrival_date", label: "Дата въезда", type: "date", defaultValue: "", category: "contract" },
      { id: "address", label: "Адрес пребывания", type: "text", defaultValue: "", category: "applicant" },
      { id: "employer", label: "Работодатель (при наличии)", type: "text", defaultValue: "", category: "employer" },
      { id: "grounds", label: "Основания для РВП", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "income", label: "Доход", type: "text", defaultValue: "", category: "payment" },
      { id: "family", label: "Члены семьи в РФ", type: "text", defaultValue: "", category: "family" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о выдаче разрешения на временное проживание</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Прошу выдать разрешение на временное проживание на территории РФ сроком на 3 года по основанию: {{{grounds}}}.</p>
  <p class="mb-4 text-justify">1.2. Цель въезда и пребывания: {{{purpose}}}. Дата въезда: {{{arrival_date}}}.</p>
  <p class="mb-4 text-justify">1.3. Адрес места пребывания: {{{address}}}. {{{family}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Обязательства</div>
  <p class="mb-4 text-justify">2.1. Обязуюсь соблюдать Конституцию РФ и законодательство, не допускать действий, создающих угрозу безопасности.</p>
  <p class="mb-4 text-justify">2.2. Обязуюсь сообщать о смене места жительства и работы в установленном порядке.</p>
  <p class="mb-4 text-justify">2.3. Источник дохода: {{{income}}}. Работодатель: {{{employer}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прилагаемые документы</div>
  <p class="mb-4 text-justify">3.1. Паспорт, миграционная карта, справка о доходах, медицинские справки, квитанция об уплате государственной пошлины.</p>

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
    id: "citizenship-app",
    name: "Заявление о приёме в гражданство РФ",
    category: "migration",
    actSource: "ФЗ № 62-ФЗ «О гражданстве Российской Федерации»",
    lastUpdated: "Август 2026",
    description: "Заявление о приёме в гражданство РФ в общем или упрощённом порядке с указанием оснований и биографических данных.",
    suggestedDocs: ["temporary-residence-app","patent-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "applicant_birth", label: "Дата рождения", type: "date", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "birth_place", label: "Место рождения", type: "text", defaultValue: "", category: "applicant" },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "nationality", label: "Гражданство", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "russia_period", label: "Срок проживания в РФ", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "visa_type", label: "Основание", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "income", label: "Источник дохода", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "address", label: "Адрес", type: "text", defaultValue: "", category: "applicant" },
      { id: "family", label: "Семейное положение", type: "text", defaultValue: "", category: "family" },
      { id: "refusal_check", label: "Отсутствие обстоятельств, препятствующих приёму", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о приёме в гражданство Российской Федерации</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Прошу принять в гражданство Российской Федерации на основании: {{{visa_type}}}.</p>
  <p class="mb-4 text-justify">1.2. {{{russia_period}}}. Адрес: {{{address}}}.</p>
  <p class="mb-4 text-justify">1.3. {{{family}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сведения о себе</div>
  <p class="mb-4 text-justify">2.1. Источник средств к существованию: {{{income}}}.</p>
  <p class="mb-4 text-justify">2.2. {{{refusal_check}}}.</p>
  <p class="mb-4 text-justify">2.3. Обязуюсь соблюдать Конституцию РФ и законодательство Российской Федерации.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прилагаемые документы</div>
  <p class="mb-4 text-justify">3.1. Паспорт, вид на жительство, свидетельства о рождении детей, документы о доходах, квитанция об уплате государственной пошлины.</p>

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
    id: "patent-app",
    name: "Заявление на патент для работы в РФ",
    category: "migration",
    actSource: "ФЗ № 115-ФЗ «О правовом положении иностранных граждан»",
    lastUpdated: "Август 2026",
    description: "Заявление иностранного гражданина о выдаче патента для осуществления трудовой деятельности в РФ.",
    suggestedDocs: ["visa-invitation","temporary-residence-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "applicant_birth", label: "Дата рождения", type: "date", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "birth_place", label: "Место рождения", type: "text", defaultValue: "", category: "applicant" },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "migration_card", label: "Миграционная карта", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "entry_date", label: "Дата въезда", type: "date", defaultValue: "", category: "contract" },
      { id: "profession", label: "Профессия", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "employer", label: "Работодатель (при наличии)", type: "text", defaultValue: "", category: "employer" },
      { id: "address", label: "Адрес пребывания", type: "text", defaultValue: "", category: "applicant" },
      { id: "region", label: "Регион осуществления деятельности", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о выдаче патента на осуществление трудовой деятельности</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Прошу выдать патент для осуществления трудовой деятельности в {{{region}}} по профессии {{{profession}}}.</p>
  <p class="mb-4 text-justify">1.2. Дата въезда: {{{entry_date}}}, миграционная карта: {{{migration_card}}}.</p>
  <p class="mb-4 text-justify">1.3. Работодатель: {{{employer}}}. Адрес пребывания: {{{address}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Обязательства</div>
  <p class="mb-4 text-justify">2.1. Обязуюсь ежемесячно вносить авансовые платежи по налогу на доходы физических лиц в фиксированном размере.</p>
  <p class="mb-4 text-justify">2.2. Обязуюсь соблюдать режим пребывания в РФ и покинуть территорию РФ по окончании срока действия патента, если патент не будет продлён.</p>
  <p class="mb-4 text-justify">2.3. Обязуюсь осуществлять трудовую деятельность только у работодателя, указанного в патенте (или в нескольких субъектах — в соответствии с законодательством).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прилагаемые документы</div>
  <p class="mb-4 text-justify">3.1. Паспорт, миграционная карта, отрывная часть уведомления о прибытии, справка об отсутствии инфекционных заболеваний, квитанция об уплате государственной пошлины.</p>

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
    id: "residence-permit-app",
    name: "Заявление о выдаче вида на жительство",
    category: "migration",
    actSource: "ст. 8 ФЗ № 115-ФЗ «О правовом положении иностранных граждан»",
    lastUpdated: "Август 2026",
    description: "Заявление о выдаче вида на жительство в РФ: основания, биографические данные, доход, обязательства.",
    suggestedDocs: ["temporary-residence-app","citizenship-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "applicant_birth", label: "Дата рождения", type: "date", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "birth_place", label: "Место рождения", type: "text", defaultValue: "", category: "applicant" },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "nationality", label: "Гражданство", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "rvp_info", label: "РВП", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "grounds", label: "Основание для ВНЖ", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "income", label: "Доход", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "address", label: "Адрес", type: "text", defaultValue: "", category: "applicant" },
      { id: "family", label: "Семья", type: "text", defaultValue: "", category: "family" },
      { id: "no_refusal", label: "Отсутствие препятствий", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о выдаче вида на жительство</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Прошу выдать вид на жительство в Российской Федерации на основании: {{{grounds}}}.</p>
  <p class="mb-4 text-justify">1.2. {{{rvp_info}}}. {{{no_refusal}}}.</p>
  <p class="mb-4 text-justify">1.3. Адрес: {{{address}}}. {{{family}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сведения</div>
  <p class="mb-4 text-justify">2.1. Источник дохода: {{{income}}}.</p>
  <p class="mb-4 text-justify">2.2. Обязуюсь соблюдать Конституцию РФ и законодательство, ежегодно подавать уведомление о подтверждении проживания.</p>
  <p class="mb-4 text-justify">2.3. Согласен на обработку персональных данных.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прилагаемые документы</div>
  <p class="mb-4 text-justify">3.1. Паспорт, РВП, справка о доходах, медицинские справки, квитанция об уплате государственной пошлины.</p>

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
  }
];
