import type { TemplateField } from "../types";

const PERSON_IP_LEGAL = [
  { label: "Физическое лицо", value: "person" },
  { label: "Индивидуальный предприниматель", value: "ip" },
  { label: "Юридическое лицо", value: "legal" },
];

const BASIS_OPTIONS = [
  { label: "Устава", value: "Устава" },
  { label: "Доверенности", value: "Доверенности" },
  { label: "Положения", value: "Положения" },
];

export const utilitiesSelect: TemplateField = {
  id: "utilities", label: "Коммунальные платежи", type: "select",
  options: [
    { label: "Включены в арендную плату", value: "Включены в арендную плату" },
    { label: "Оплачиваются арендатором отдельно", value: "Оплачиваются арендатором отдельно" },
  ],
  defaultValue: "Включены в арендную плату", category: "payment",
};

export function sideFields(
  s: string,
  label: string,
  cat: TemplateField["category"]
): TemplateField[] {
  return [
    {
      id: `${s}_status`, label: `${label}: статус`, type: "radio",
      defaultValue: "person", category: cat, options: PERSON_IP_LEGAL,
    },
    {
      id: `${s}_name`, label: `${label}: ФИО или наименование`, type: "text",
      defaultValue: "", category: cat, validation: { required: true },
    },
    {
      id: `${s}_inn`, label: `${label}: ИНН`, type: "text", defaultValue: "",
      category: cat,
      dependsOn: [{ fieldId: `${s}_status`, values: ["ip", "legal"] }],
    },
    {
      id: `${s}_passport`, label: `${label}: паспорт (серия и номер)`, type: "text",
      defaultValue: "", category: cat,
      dependsOn: [{ fieldId: `${s}_status`, value: "person" }],
    },
    {
      id: `${s}_rep`, label: `${label}: в лице (должность и ФИО)`, type: "text",
      defaultValue: "", category: cat,
      dependsOn: [{ fieldId: `${s}_status`, value: "legal" }],
    },
    {
      id: `${s}_basis`, label: `${label}: действует на основании`, type: "select",
      options: BASIS_OPTIONS, defaultValue: "Устава", category: cat,
      dependsOn: [{ fieldId: `${s}_status`, value: "legal" }],
    },
    {
      id: `${s}_address`, label: `${label}: адрес`, type: "text", defaultValue: "",
      category: cat,
    },
    {
      id: `${s}_phone`, label: `${label}: телефон`, type: "text", defaultValue: "",
      category: cat,
    },
  ];
}

export function sideBlock(s: string, role: string): string {
  return `
      {{#${s}_status_is_person}}
        <p class="mb-1 text-sm"><strong>${role}: {{${s}_name}}</strong></p>
        {{#${s}_passport}}<p class="text-xs mb-0.5">Паспорт: {{${s}_passport}}</p>{{/${s}_passport}}
        {{#${s}_address}}<p class="text-xs mb-0.5">Адрес: {{${s}_address}}</p>{{/${s}_address}}
        {{#${s}_phone}}<p class="text-xs mb-0.5">Телефон: {{${s}_phone}}</p>{{/${s}_phone}}
      {{/${s}_status_is_person}}
      {{#${s}_status_is_ip}}
        <p class="mb-1 text-sm"><strong>Индивидуальный предприниматель {{${s}_name}}</strong></p>
        {{#${s}_inn}}<p class="text-xs mb-0.5">ИНН: {{${s}_inn}}</p>{{/${s}_inn}}
        {{#${s}_address}}<p class="text-xs mb-0.5">Адрес: {{${s}_address}}</p>{{/${s}_address}}
        {{#${s}_phone}}<p class="text-xs mb-0.5">Телефон: {{${s}_phone}}</p>{{/${s}_phone}}
      {{/${s}_status_is_ip}}
      {{#${s}_status_is_legal}}
        <p class="mb-1 text-sm"><strong>{{${s}_name}}</strong></p>
        {{#${s}_inn}}<p class="text-xs mb-0.5">ИНН: {{${s}_inn}}</p>{{/${s}_inn}}
        {{#${s}_rep}}<p class="text-xs mb-0.5">В лице: {{${s}_rep}}, действующего на основании {{${s}_basis}}</p>{{/${s}_rep}}
        {{#${s}_address}}<p class="text-xs mb-0.5">Адрес: {{${s}_address}}</p>{{/${s}_address}}
        {{#${s}_phone}}<p class="text-xs mb-0.5">Телефон: {{${s}_phone}}</p>{{/${s}_phone}}
      {{/${s}_status_is_legal}}`;
}

export function saleIntro(sellerRole = "Продавец", buyerRole = "Покупатель"): string {
  return `
  <p class="mb-4 text-justify">
    {{#seller_status_is_person}}Гражданин(-ка) РФ <strong>{{seller_name}}</strong>{{/seller_status_is_person}}
    {{#seller_status_is_ip}}Индивидуальный предприниматель <strong>{{seller_name}}</strong>{{/seller_status_is_ip}}
    {{#seller_status_is_legal}}<strong>{{seller_name}}</strong>{{/seller_status_is_legal}}
    {{#seller_status_is_legal}}{{#seller_rep}}в лице {{seller_rep}}, действующего на основании {{seller_basis}},{{/seller_rep}}{{/seller_status_is_legal}}
    {{#seller_inn}}ИНН {{seller_inn}},{{/seller_inn}} именуемый(ая) в дальнейшем «${sellerRole}», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    {{#buyer_status_is_person}}гражданин(-ка) РФ <strong>{{buyer_name}}</strong>{{/buyer_status_is_person}}
    {{#buyer_status_is_ip}}индивидуальный предприниматель <strong>{{buyer_name}}</strong>{{/buyer_status_is_ip}}
    {{#buyer_status_is_legal}}<strong>{{buyer_name}}</strong>{{/buyer_status_is_legal}}
    {{#buyer_status_is_legal}}{{#buyer_rep}}в лице {{buyer_rep}}, действующего на основании {{buyer_basis}},{{/buyer_rep}}{{/buyer_status_is_legal}}
    {{#buyer_inn}}ИНН {{buyer_inn}},{{/buyer_inn}} именуемый(ая) в дальнейшем «${buyerRole}», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>`;
}

export function rentIntro(l: string, t: string): string {
  return `
  <p class="mb-4 text-justify">
    {{#landlord_status_is_person}}Гражданин(-ка) РФ <strong>{{landlord_name}}</strong>{{/landlord_status_is_person}}
    {{#landlord_status_is_ip}}Индивидуальный предприниматель <strong>{{landlord_name}}</strong>{{/landlord_status_is_ip}}
    {{#landlord_status_is_legal}}<strong>{{landlord_name}}</strong>{{/landlord_status_is_legal}}
    {{#landlord_status_is_legal}}{{#landlord_rep}}в лице {{landlord_rep}}, действующего на основании {{landlord_basis}},{{/landlord_rep}}{{/landlord_status_is_legal}}
    {{#landlord_inn}}ИНН {{landlord_inn}},{{/landlord_inn}} именуемый(ая) в дальнейшем «${l}», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    {{#tenant_status_is_person}}гражданин(-ка) РФ <strong>{{tenant_name}}</strong>{{/tenant_status_is_person}}
    {{#tenant_status_is_ip}}индивидуальный предприниматель <strong>{{tenant_name}}</strong>{{/tenant_status_is_ip}}
    {{#tenant_status_is_legal}}<strong>{{tenant_name}}</strong>{{/tenant_status_is_legal}}
    {{#tenant_status_is_legal}}{{#tenant_rep}}в лице {{tenant_rep}}, действующего на основании {{tenant_basis}},{{/tenant_rep}}{{/tenant_status_is_legal}}
    {{#tenant_inn}}ИНН {{tenant_inn}},{{/tenant_inn}} именуемый(ая) в дальнейшем «${t}», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>`;
}

export function pairIntro(s1: string, r1: string, s2: string, r2: string): string {
  return `
  <p class="mb-4 text-justify">
    {{#${s1}_status_is_person}}Гражданин(-ка) РФ <strong>{{${s1}_name}}</strong>{{/${s1}_status_is_person}}
    {{#${s1}_status_is_ip}}Индивидуальный предприниматель <strong>{{${s1}_name}}</strong>{{/${s1}_status_is_ip}}
    {{#${s1}_status_is_legal}}<strong>{{${s1}_name}}</strong>{{/${s1}_status_is_legal}}
    {{#${s1}_status_is_legal}}{{#${s1}_rep}}в лице {{${s1}_rep}}, действующего на основании {{${s1}_basis}},{{/${s1}_rep}}{{/${s1}_status_is_legal}}
    {{#${s1}_inn}}ИНН {{${s1}_inn}},{{/${s1}_inn}} именуемый(ая) в дальнейшем «${r1}», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    {{#${s2}_status_is_person}}гражданин(-ка) РФ <strong>{{${s2}_name}}</strong>{{/${s2}_status_is_person}}
    {{#${s2}_status_is_ip}}индивидуальный предприниматель <strong>{{${s2}_name}}</strong>{{/${s2}_status_is_ip}}
    {{#${s2}_status_is_legal}}<strong>{{${s2}_name}}</strong>{{/${s2}_status_is_legal}}
    {{#${s2}_status_is_legal}}{{#${s2}_rep}}в лице {{${s2}_rep}}, действующего на основании {{${s2}_basis}},{{/${s2}_rep}}{{/${s2}_status_is_legal}}
    {{#${s2}_inn}}ИНН {{${s2}_inn}},{{/${s2}_inn}} именуемый(ая) в дальнейшем «${r2}», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>`;
}

export function pairSign(s1: string, r1: string, s2: string, r2: string): string {
  return `
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1 uppercase text-black">${r1}:</div>
      {{#${s1}_status_is_person}}<p class="mb-1"><strong>{{${s1}_name}}</strong></p>{{/${s1}_status_is_person}}
      {{#${s1}_status_is_ip}}<p class="mb-1"><strong>ИП {{${s1}_name}}</strong></p>{{/${s1}_status_is_ip}}
      {{#${s1}_status_is_legal}}<p class="mb-1"><strong>{{${s1}_name}}</strong></p>{{/${s1}_status_is_legal}}
      {{#${s1}_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{${s1}_inn}}</p>{{/${s1}_inn}}
      {{#${s1}_address}}<p class="text-zinc-500 text-[11px]">Адрес: {{${s1}_address}}</p>{{/${s1}_address}}
      {{#${s1}_phone}}<p class="text-zinc-500 text-[11px]">Телефон: {{${s1}_phone}}</p>{{/${s1}_phone}}
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-1 uppercase text-black">${r2}:</div>
      {{#${s2}_status_is_person}}<p class="mb-1"><strong>{{${s2}_name}}</strong></p>{{/${s2}_status_is_person}}
      {{#${s2}_status_is_ip}}<p class="mb-1"><strong>ИП {{${s2}_name}}</strong></p>{{/${s2}_status_is_ip}}
      {{#${s2}_status_is_legal}}<p class="mb-1"><strong>{{${s2}_name}}</strong></p>{{/${s2}_status_is_legal}}
      {{#${s2}_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{${s2}_inn}}</p>{{/${s2}_inn}}
      {{#${s2}_address}}<p class="text-zinc-500 text-[11px]">Адрес: {{${s2}_address}}</p>{{/${s2}_address}}
      {{#${s2}_phone}}<p class="text-zinc-500 text-[11px]">Телефон: {{${s2}_phone}}</p>{{/${s2}_phone}}
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`;
}

export function commonClauses(
  claimDays = 10,
  disputeHint?: string
): string {
  return `
  <div class="font-bold mb-2 text-black text-xs uppercase">Форс-мажор</div>
  <p class="mb-4 text-justify">
    Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами. Сторона, для которой создалась невозможность исполнения обязательств, обязана письменно уведомить другую сторону не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Порядок разрешения споров</div>
  <p class="mb-4 text-justify">
    Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — ${claimDays} календарных дней с момента её получения. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.${disputeHint || ""}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Заключительные положения</div>
  <p class="mb-4 text-justify">
    Настоящий договор составлен в двух экземплярах, имеющих равную юридическую силу, по одному для каждой из сторон. Во всём, что не предусмотрено настоящим договором, стороны руководствуются действующим законодательством Российской Федерации.
  </p>`;
}

export function saleSign(sellerRole = "Продавец", buyerRole = "Покупатель"): string {
  return `
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1 uppercase text-black">${sellerRole}:</div>
      {{#seller_status_is_person}}<p class="mb-1"><strong>{{seller_name}}</strong></p>{{/seller_status_is_person}}
      {{#seller_status_is_ip}}<p class="mb-1"><strong>ИП {{seller_name}}</strong></p>{{/seller_status_is_ip}}
      {{#seller_status_is_legal}}<p class="mb-1"><strong>{{seller_name}}</strong></p>{{/seller_status_is_legal}}
      {{#seller_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{seller_inn}}</p>{{/seller_inn}}
      {{#seller_address}}<p class="text-zinc-500 text-[11px]">Адрес: {{seller_address}}</p>{{/seller_address}}
      {{#seller_phone}}<p class="text-zinc-500 text-[11px]">Телефон: {{seller_phone}}</p>{{/seller_phone}}
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-1 uppercase text-black">${buyerRole}:</div>
      {{#buyer_status_is_person}}<p class="mb-1"><strong>{{buyer_name}}</strong></p>{{/buyer_status_is_person}}
      {{#buyer_status_is_ip}}<p class="mb-1"><strong>ИП {{buyer_name}}</strong></p>{{/buyer_status_is_ip}}
      {{#buyer_status_is_legal}}<p class="mb-1"><strong>{{buyer_name}}</strong></p>{{/buyer_status_is_legal}}
      {{#buyer_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{buyer_inn}}</p>{{/buyer_inn}}
      {{#buyer_address}}<p class="text-zinc-500 text-[11px]">Адрес: {{buyer_address}}</p>{{/buyer_address}}
      {{#buyer_phone}}<p class="text-zinc-500 text-[11px]">Телефон: {{buyer_phone}}</p>{{/buyer_phone}}
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`;
}

export function rentSign(l: string, t: string): string {
  return `
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1 uppercase text-black">${l}:</div>
      {{#landlord_status_is_person}}<p class="mb-1"><strong>{{landlord_name}}</strong></p>{{/landlord_status_is_person}}
      {{#landlord_status_is_ip}}<p class="mb-1"><strong>ИП {{landlord_name}}</strong></p>{{/landlord_status_is_ip}}
      {{#landlord_status_is_legal}}<p class="mb-1"><strong>{{landlord_name}}</strong></p>{{/landlord_status_is_legal}}
      {{#landlord_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{landlord_inn}}</p>{{/landlord_inn}}
      {{#landlord_address}}<p class="text-zinc-500 text-[11px]">Адрес: {{landlord_address}}</p>{{/landlord_address}}
      {{#landlord_phone}}<p class="text-zinc-500 text-[11px]">Телефон: {{landlord_phone}}</p>{{/landlord_phone}}
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-1 uppercase text-black">${t}:</div>
      {{#tenant_status_is_person}}<p class="mb-1"><strong>{{tenant_name}}</strong></p>{{/tenant_status_is_person}}
      {{#tenant_status_is_ip}}<p class="mb-1"><strong>ИП {{tenant_name}}</strong></p>{{/tenant_status_is_ip}}
      {{#tenant_status_is_legal}}<p class="mb-1"><strong>{{tenant_name}}</strong></p>{{/tenant_status_is_legal}}
      {{#tenant_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{tenant_inn}}</p>{{/tenant_inn}}
      {{#tenant_address}}<p class="text-zinc-500 text-[11px]">Адрес: {{tenant_address}}</p>{{/tenant_address}}
      {{#tenant_phone}}<p class="text-zinc-500 text-[11px]">Телефон: {{tenant_phone}}</p>{{/tenant_phone}}
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`;
}

/**
 * Налоговая оговорка (защита от претензий ФНС по ст. 54.1 НК РФ).
 *
 * Два самостоятельных правовых механизма:
 *  1) СТ. 431.2 ГК РФ — заверения об обстоятельствах (убытки при
 *     недостоверности; без вины при предпринимательской деятельности);
 *  2) СТ. 406.1 ГК РФ — возмещение имущественных потерь БЕЗ доказывания
 *     вины и нарушения обязательства (Пленум ВС РФ от 24.03.2016 № 7, п. 15-17).
 *
 * Оговорка не подменяет проверку контрагента, но подтверждает «должную
 * осмотрительность» (письма ФНС РФ от 10.03.2021 № БВ-4-7/3060@ и др.).
 * Включается чекбоксом tax_clause: {{#tax_clause}}…{{/tax_clause}}.
 */
export function taxClause(): string {
  return `
  {{#tax_clause}}
  <div class="font-bold mb-2 text-black text-xs uppercase">Заверения об обстоятельствах (ст. 431.2 ГК РФ)</div>
  <p class="mb-4 text-justify">
    Сторона, являющаяся предпринимателем (исполнитель/контрагент), заверяет другую сторону об обстоятельствах, имеющих значение для заключения, исполнения и прекращения настоящего договора: она зарегистрирована в установленном порядке, в отношении неё не введена процедура банкротства и не начата ликвидация, она надлежащим образом уплачивает налоги, сборы и страховые взносы, представляет налоговую и бухгалтерскую отчётность, не является «технической» организацией, не совершает операций, имеющих своей единственной целью получение налоговой выгоды, и располагает необходимыми персоналом, лицензиями, допусками и иными ресурсами для исполнения обязательств по настоящему договору. Сторона, полагавшаяся на недостоверные заверения, вправе требовать от лица, давшего такие заверения, возмещения убытков, а в случаях, предусмотренных законом, — уплаты предусмотренной неустойки. Сторона, давшая недостоверные заверения при осуществлении предпринимательской деятельности, отвечает за причинённые убытки независимо от своей вины (п. 4 ст. 431.2 ГК РФ). Заверение считается существенным, если сделка совершена в разумной зависимости от него (п. 1 ст. 431.2 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Возмещение имущественных потерь (ст. 406.1 ГК РФ)</div>
  <p class="mb-4 text-justify">
    Стороны установили, что Сторона, являющаяся предпринимателем (исполнитель/контрагент), обязана возместить другой стороне имущественные потери, возникшие в связи с обстоятельствами, за которые данная Сторона несёт ответственность на основании настоящего пункта, а именно: отказ налогового органа в применении вычета по НДС по сделкам во исполнение настоящего договора; доначисление налога на прибыль (иных налогов), пеней и штрафов в связи с признанием расходов (вычетов) по настоящему договору неправомерными; применение налоговым органом положений ст. 54.1 НК РФ в отношении операций по настоящему договору; а также судебные и иные расходы, понесённые стороной в связи с защитой от указанных требований. Потери возмещаются в размере, не превышающем сумму доначисленных налогов, пеней и штрафов (с учётом судебных расходов), в течение 10 (десяти) рабочих дней с момента получения мотивированного письменного требования и подтверждающих документов. Соглашение о возмещении потерь является явным, недвусмысленным и подлежит принудительному исполнению без необходимости доказывания вины и причинённого нарушения обязательства со стороны понёсшего потери лица; потери считаются понесёнными при наступлении предусмотренных настоящим пунктом обстоятельств, независимо от наступления обстоятельств, являющихся основанием для привлечения к ответственности (п. 3 ст. 406.1 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Налоговая добросовестность (ст. 54.1 НК РФ)</div>
  <p class="mb-4 text-justify">
    Стороны подтверждают, что реальность хозяйственных операций по настоящему договору обеспечивается: подписанием первичных учётных документов уполномоченными лицами; предоставлением сторонами друг другу выписок из ЕГРЮЛ/ЕГРИП, копий документов, подтверждающих полномочия руководителя, и сведений о банковских реквизитах; а также последующим исполнением сторонами обязательств в соответствии с условиями настоящего договора. Достоверность представленных сведений может быть проверена стороной по открытым данным ФНС России (e-ecrul.nalog.ru, rmsp.nalog.ru) до заключения настоящего договора.
  </p>
  {{/tax_clause}}`;
}

export function pageShell(title: string): string {
  return `
<div class="pl-[20mm] pr-[15mm] pt-[20mm] pb-[20mm] font-serif text-base leading-normal text-zinc-900 bg-white">
  <div class="doc-title text-center font-bold text-base uppercase mb-2">${title}</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{city}}</div>
    <div>«{{date}}»</div>
  </div>`;
}