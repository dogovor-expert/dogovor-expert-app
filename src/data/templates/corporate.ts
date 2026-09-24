import type { LegalTemplate } from "../types";
import { pageShell } from "./parts";

/**
 * Корпоративные документы ООО (поштучно по кейсам).
 *
 * Решения оформлены для общества с единственным участником (ст. 39 ФЗ-14);
 * при нескольких участниках используется протокол общего собрания
 * (llc-meeting-minutes) или протокол заочного голосования (protocol-absentee).
 * Все документы — свободная форма, конструктором.
 */

function decisionSign(roleLabel: string, fieldId: string): string {
  return `
  <div class="mt-10 text-xs">
    <p class="mb-1">${roleLabel}: <strong>{{${fieldId}}}</strong></p>
    <div class="border-b border-zinc-950 w-64 h-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
  </div>
</div>`;
}

function meetingSign(): string {
  return `
  <div class="mt-10 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Председатель собрания: <strong>{{chairman_fio}}</strong></p>
    <div class="border-b border-zinc-950 w-64 h-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
    <p class="mt-5 mb-1">Секретарь собрания: <strong>{{secretary_fio}}</strong></p>
    <div class="border-b border-zinc-950 w-64 h-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
  </div>
</div>`;
}

function companyLine(): string {
  return `
  <p class="text-center font-semibold mb-4">{{company_name}}{{#company_inn}} (ИНН {{company_inn}}){{/company_inn}}</p>`;
}

export const TEMPLATES_CORPORATE: LegalTemplate[] = [
  {
    id: "decision-major-deal",
    name: "Решение об одобрении крупной сделки",
    category: "business",
    actSource: "ст. 39, 46 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение единственного участника ООО об одобрении крупной сделки: определяется предмет, контрагент и цена. Крупной считается сделка на сумму 25% и более балансовой стоимости активов общества (ст. 46 ФЗ-14). При нескольких участниках решение принимается общим собранием.",
    suggestedDocs: ["llc-meeting-minutes", "sole-member-decision", "decision-interested-deal"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата решения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "decision_number", label: "Номер решения", type: "text", defaultValue: "" , category: "contract" },
      { id: "deal_subject", label: "Предмет сделки", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "counterparty", label: "Контрагент (наименование/ФИО)", type: "text", defaultValue: "", category: "contract" },
      { id: "deal_amount", label: "Цена сделки (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "member_fio", label: "Единственный участник (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Решение об одобрении крупной сделки") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Единственный участник ООО{{#company_inn}} (ИНН {{company_inn}}){{/company_inn}} <strong>{{member_fio}}</strong>,
    руководствуясь ст. 39 и 46 Федерального закона от 08.02.1998 № 14-ФЗ «Об обществах с ограниченной ответственностью», <strong>решил:</strong>
  </p>
  <p class="mb-4 text-justify">
    1. Одобрить крупную сделку — {{deal_subject}}{{#counterparty}}, заключаемую с {{counterparty}}{{/counterparty}},
    на сумму <strong>{{deal_amount}} ({{deal_amount_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    2. Сделка совершается на условиях, определённых проектом договора. Настоящее согласие на совершение сделки действует до «{{date}}» и может быть отозвано до её совершения.
  </p>
  <p class="mb-4 text-justify">
    3. {{#decision_number}}Решение № {{decision_number}}. {{/decision_number}}Решение является окончательным и оформляется в письменной форме (ст. 39 ФЗ-14).
  </p>` +
      decisionSign("Единственный участник", "member_fio"),
  },
  {
    id: "decision-interested-deal",
    name: "Решение об одобрении сделки с заинтересованностью",
    category: "business",
    actSource: "ст. 39, 45 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение единственного участника ООО об одобрении сделки, в совершении которой имеется заинтересованность. Для сделки с заинтересованностью требуется согласие общего собрания (ст. 45 ФЗ-14); лицо, заинтересованное в сделке, не участвует в голосовании, если это предусмотрено уставом.",
    suggestedDocs: ["llc-meeting-minutes", "decision-major-deal", "sole-member-decision"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата решения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "interested_person", label: "Заинтересованное лицо (ФИО/наименование)", type: "text", defaultValue: "", category: "representative" },
      { id: "interest_basis", label: "Основание заинтересованности", type: "textarea", defaultValue: "", category: "contract", rows: 2 },
      { id: "deal_subject", label: "Предмет сделки", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "deal_amount", label: "Цена сделки (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "member_fio", label: "Единственный участник (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Решение об одобрении сделки с заинтересованностью") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Единственный участник ООО{{#company_inn}} (ИНН {{company_inn}}){{/company_inn}} <strong>{{member_fio}}</strong>,
    рассмотрев вопрос об одобрении сделки, в совершении которой имеется заинтересованность, руководствуясь ст. 39 и 45 ФЗ-14 «Об ООО», <strong>решил:</strong>
  </p>
  <p class="mb-4 text-justify">
    1. Одобрить сделку — {{deal_subject}} — на сумму <strong>{{deal_amount}} ({{deal_amount_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    2. Сведения о заинтересованном лице: {{interested_person}}{{#interest_basis}}. Основание заинтересованности: {{interest_basis}}{{/interest_basis}}.
  </p>
  <p class="mb-4 text-justify">
    3. Лицо, заинтересованное в совершении сделки, в голосовании не участвовало; сведения о нём раскрыты участникам до принятия решения.
  </p>` +
      decisionSign("Единственный участник", "member_fio"),
  },
  {
    id: "decision-increase-capital",
    name: "Решение об увеличении уставного капитала",
    category: "business",
    actSource: "ст. 19, 39 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение единственного участника ООО об увеличении уставного капитала за счёт вклада участника или дополнительных вкладов. Изменения подлежат государственной регистрации в течение месяца со дня принятия решения (ст. 19 ФЗ-14).",
    suggestedDocs: ["decision-admit-member", "sole-member-decision", "participants-list"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата решения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "old_capital", label: "Уставный капитал до увеличения (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "new_capital", label: "Уставный капитал после увеличения (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "contribution_source", label: "Источник увеличения (вклад участника / доп. вклады)", type: "text", defaultValue: "", category: "contract" },
      { id: "member_fio", label: "Единственный участник (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Решение об увеличении уставного капитала") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Единственный участник <strong>{{member_fio}}</strong>, руководствуясь ст. 19 и 39 ФЗ-14 «Об ООО», <strong>решил:</strong>
  </p>
  <p class="mb-4 text-justify">
    1. Увеличить уставный капитал Общества{{#old_capital}} с {{old_capital}} рублей{{/old_capital}} до <strong>{{new_capital}} ({{new_capital_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    2. Источник увеличения: {{contribution_source}}{{^contribution_source}}вклад участника{{/contribution_source}}. Вклад внесён полностью до принятия настоящего решения; денежные средства поступили на расчётный счёт Общества.
  </p>
  <p class="mb-4 text-justify">
    3. Внести соответствующие изменения в устав Общества и обеспечить их государственную регистрацию в течение месяца со дня внесения в полном объёме вкладов (п. 2.1 ст. 19 ФЗ-14).
  </p>` +
      decisionSign("Единственный участник", "member_fio"),
  },
  {
    id: "decision-decrease-capital",
    name: "Решение об уменьшении уставного капитала",
    category: "business",
    actSource: "ст. 20, 39 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение единственного участника ООО об уменьшении уставного капитала. Общество обязано уведомить кредиторов и опубликовать сведения в «Вестнике государственной регистрации» (ст. 20 ФЗ-14). Уставный капитал не может быть меньше 10 000 рублей.",
    suggestedDocs: ["participants-list", "sole-member-decision", "decision-increase-capital"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата решения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "old_capital", label: "Уставный капитал до уменьшения (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "new_capital", label: "Уставный капитал после уменьшения (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "reason", label: "Основание уменьшения", type: "text", defaultValue: "", category: "contract" },
      { id: "member_fio", label: "Единственный участник (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Решение об уменьшении уставного капитала") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Единственный участник <strong>{{member_fio}}</strong>, руководствуясь ст. 20 и 39 ФЗ-14 «Об ООО», <strong>решил:</strong>
  </p>
  <p class="mb-4 text-justify">
    1. Уменьшить уставный капитал Общества с {{old_capital}} рублей до <strong>{{new_capital}} ({{new_capital_words}})</strong> рублей{{#reason}} — {{reason}}{{/reason}}.
  </p>
  <p class="mb-4 text-justify">
    2. Уставный капитал после уменьшения не ниже минимального размера — 10 000 рублей (п. 1 ст. 14 ФЗ-14).
  </p>
  <p class="mb-4 text-justify">
    3. Уведомить кредиторов об уменьшении уставного капитала и опубликовать сведения в «Вестнике государственной регистрации» в порядке и сроки, установленные ст. 20 ФЗ-14.
  </p>` +
      decisionSign("Единственный участник", "member_fio"),
  },
  {
    id: "decision-change-director",
    name: "Решение о смене генерального директора",
    category: "business",
    actSource: "ст. 33, 40, 39 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение единственного участника ООО о прекращении полномочий прежнего и назначении нового генерального директора, утверждении срока полномочий. Сведения о директоре подлежат внесению в ЕГРЮЛ (ст. 5 ФЗ-129).",
    suggestedDocs: ["sole-member-decision", "llc-meeting-minutes", "participants-list"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата решения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "old_director", label: "Прежний генеральный директор (ФИО)", type: "text", defaultValue: "", category: "representative" },
      { id: "new_director", label: "Новый генеральный директор (ФИО)", type: "text", defaultValue: "", category: "representative", validation: { required: true } },
      { id: "director_term", label: "Срок полномочий (например, 3 года)", type: "text", defaultValue: "3 года", category: "contract" },
      { id: "member_fio", label: "Единственный участник (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Решение о смене генерального директора") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Единственный участник <strong>{{member_fio}}</strong>, руководствуясь ст. 33, 39 и 40 ФЗ-14 «Об ООО», <strong>решил:</strong>
  </p>
  <p class="mb-4 text-justify">
    1. Прекратить полномочия {{#old_director}}генерального директора <strong>{{old_director}}</strong>{{/old_director}}{{^old_director}}действующего генерального директора{{/old_director}} с «{{date}}».
  </p>
  <p class="mb-4 text-justify">
    2. Назначить на должность генерального директора <strong>{{new_director}}</strong> сроком на {{director_term}}, с правом действовать от имени Общества без доверенности.
  </p>
  <p class="mb-4 text-justify">
    3. Обеспечить государственную регистрацию изменений сведений о лице, имеющем право действовать без доверенности, в ЕГРЮЛ (ст. 5 Федерального закона от 08.08.2001 № 129-ФЗ) в течение 7 рабочих дней.
  </p>` +
      decisionSign("Единственный участник", "member_fio"),
  },
  {
    id: "decision-change-address",
    name: "Решение об изменении места нахождения общества",
    category: "business",
    actSource: "ст. 17 ФЗ-14 «Об ООО», ст. 5 ФЗ-129",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение единственного участника ООО об изменении места нахождения общества. Изменение регистрируется в ЕГРЮЛ; при смене региона действует порядок, установленный п. 6 ст. 17 ФЗ-14 (уведомление за 20 дней).",
    suggestedDocs: ["charter-llc", "sole-member-decision", "participants-list"],
    fields: [
      { id: "city", label: "Город (место принятия решения)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата решения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "old_address", label: "Прежний адрес", type: "text", defaultValue: "", category: "business" },
      { id: "new_address", label: "Новый адрес", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "member_fio", label: "Единственный участник (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Решение об изменении места нахождения общества") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Единственный участник <strong>{{member_fio}}</strong>, руководствуясь ст. 17 ФЗ-14 «Об ООО» и ст. 5 Федерального закона № 129-ФЗ, <strong>решил:</strong>
  </p>
  <p class="mb-4 text-justify">
    1. Изменить место нахождения Общества{{#old_address}} с {{old_address}}{{/old_address}} на <strong>{{new_address}}</strong>.
  </p>
  <p class="mb-4 text-justify">
    2. Утвердить новую редакцию устава с указанием нового места нахождения и обеспечить государственную регистрацию изменений.
  </p>
  <p class="mb-4 text-justify">
    3. {{#new_address}}Заявление по форме Р13014 (или Р14001 в части адреса) подаётся в течение 7 рабочих дней; при смене региона предварительное уведомление направляется за 20 дней (п. 6 ст. 17 ФЗ-14).{{/new_address}}
  </p>` +
      decisionSign("Единственный участник", "member_fio"),
  },
  {
    id: "decision-admit-member",
    name: "Решение о приёме нового участника в ООО",
    category: "business",
    actSource: "ст. 19, 39 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение единственного участника ООО о приёме нового участника за счёт внесения им дополнительного вклада и увеличении уставного капитала. Доли определяются пропорционально размерам вкладов; изменения регистрируются в ЕГРЮЛ.",
    suggestedDocs: ["decision-increase-capital", "participants-list", "charter-llc"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата решения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "existing_member", label: "Действующий участник (ФИО)", type: "text", defaultValue: "", category: "business" },
      { id: "new_member_fio", label: "Новый участник (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "new_member_contribution", label: "Дополнительный вклад (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "new_capital", label: "Уставный капитал после увеличения (руб.)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate:
      pageShell("Решение о приёме нового участника в ООО") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Участник <strong>{{existing_member}}</strong>, руководствуясь ст. 19 и 39 ФЗ-14 «Об ООО», <strong>решил:</strong>
  </p>
  <p class="mb-4 text-justify">
    1. Принять в состав участников Общества <strong>{{new_member_fio}}</strong> за счёт внесения дополнительного вклада в размере
    <strong>{{new_member_contribution}} ({{new_member_contribution_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    2. {{#new_capital}}Увеличить уставный капитал Общества до {{new_capital}} рублей. {{/new_capital}}Определить размер доли нового участника пропорционально размеру внесённого дополнительного вклада.
  </p>
  <p class="mb-4 text-justify">
    3. Внести изменения в устав и список участников, обеспечить государственную регистрацию изменений в ЕГРЮЛ (ст. 19 ФЗ-14).
  </p>` +
      decisionSign("Участник", "existing_member"),
  },
  {
    id: "decision-liquidate",
    name: "Решение о ликвидации ООО",
    category: "business",
    actSource: "ст. 61–63 ГК РФ, ст. 39, 57 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение единственного участника ООО о добровольной ликвидации: назначение ликвидатора (ликвидационной комиссии), срок ликвидации, уведомление регистрирующего органа. Промежуточный и ликвидационный балансы утверждаются после расчётов с кредиторами.",
    suggestedDocs: ["participants-list", "sole-member-decision", "charter-llc"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата решения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "liquidator", label: "Ликвидатор / ликвидационная комиссия (ФИО, должность)", type: "text", defaultValue: "", category: "representative", validation: { required: true } },
      { id: "liquidation_term", label: "Срок ликвидации", type: "text", defaultValue: "", category: "contract" },
      { id: "member_fio", label: "Единственный участник (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Решение о ликвидации ООО") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Единственный участник <strong>{{member_fio}}</strong>, руководствуясь ст. 61–63 ГК РФ и ст. 57 ФЗ-14 «Об ООО», <strong>решил:</strong>
  </p>
  <p class="mb-4 text-justify">
    1. Ликвидировать Общество в добровольном порядке{{#liquidation_term}} в срок до {{liquidation_term}}{{/liquidation_term}}.
  </p>
  <p class="mb-4 text-justify">
    2. Назначить ликвидатором: <strong>{{liquidator}}</strong>. С момента назначения к ликвидатору переходят полномочия по управлению делами Общества, в том числе выступление от имени Общества в суде.
  </p>
  <p class="mb-4 text-justify">
    3. Ликвидатору: уведомить регистрирующий орган (форма Р15016), опубликовать сообщение о ликвидации в «Вестнике государственной регистрации», принять меры к выявлению кредиторов, составить промежуточный и ликвидационный балансы, произвести расчёты и распределить оставшееся имущество между участниками (ст. 63 ГК РФ).
  </p>` +
      decisionSign("Единственный участник", "member_fio"),
  },
  {
    id: "decision-approve-charter",
    name: "Решение об утверждении устава в новой редакции",
    category: "business",
    actSource: "ст. 33, 39 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение единственного участника ООО об утверждении устава в новой редакции и внесении изменений в ЕГРЮЛ. Изменения, связанные с уставом, регистрируются по форме Р13014 в течение 7 рабочих дней.",
    suggestedDocs: ["charter-llc", "sole-member-decision", "participants-list"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата решения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "charter_changes", label: "Что изменяется в уставе", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "member_fio", label: "Единственный участник (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Решение об утверждении устава в новой редакции") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Единственный участник <strong>{{member_fio}}</strong>, руководствуясь ст. 33 и 39 ФЗ-14 «Об ООО», <strong>решил:</strong>
  </p>
  <p class="mb-4 text-justify">
    1. Утвердить устав Общества в новой редакции. Внесённые изменения: {{charter_changes}}.
  </p>
  <p class="mb-4 text-justify">
    2. Считать прежнюю редакцию устава утратившей силу с момента государственной регистрации изменений.
  </p>
  <p class="mb-4 text-justify">
    3. Обеспечить государственную регистрацию изменений по форме Р13014 в течение 7 рабочих дней (ст. 17, 19 ФЗ-14).
  </p>` +
      decisionSign("Единственный участник", "member_fio"),
  },
  {
    id: "protocol-absentee-voting",
    name: "Протокол заочного голосования общего собрания участников ООО",
    category: "business",
    actSource: "ст. 37, 38 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Протокол общего собрания участников ООО, проводимого заочным голосованием (без совместного присутствия). Результаты определяются по числу полученных бюллетеней/опросных листов; заочная форма допускается, если решение не требует обсуждения.",
    suggestedDocs: ["llc-meeting-minutes", "ballot-voting", "participants-list"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата окончания приёма бюллетеней", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "protocol_number", label: "Номер протокола", type: "text", defaultValue: "", category: "contract" },
      { id: "members_count", label: "Число участников", type: "number", defaultValue: "", category: "business" },
      { id: "agenda", label: "Повестка дня", type: "textarea", defaultValue: "", category: "business", rows: 2, validation: { required: true } },
      { id: "votes_for", label: "Голосов «за» (%)", type: "number", defaultValue: "", category: "business" },
      { id: "votes_against", label: "Голосов «против» (%)", type: "number", defaultValue: "", category: "business" },
      { id: "chairman_fio", label: "Председатель собрания (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "secretary_fio", label: "Секретарь собрания (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Протокол заочного голосования общего собрания участников") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    {{#protocol_number}}Протокол № {{protocol_number}}. {{/protocol_number}}Форма проведения — заочное голосование (без совместного присутствия) в порядке ст. 38 ФЗ-14 «Об ООО».
    Дата окончания приёма бюллетеней — «{{date}}». Число участников — {{members_count}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Повестка дня</div>
  <p class="mb-4 text-justify">{{agenda}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Результаты голосования</div>
  <p class="mb-4 text-justify">
    По вопросам повестки дня поступили бюллетени (опросные листы) от участников, обладающих в совокупности более чем половиной голосов.
    Голосов «за» — {{votes_for}}%, «против» — {{votes_against}}%{{^votes_against}}0%{{/votes_against}}. Решения приняты простым большинством голосов, а по вопросам, требующим единогласия (в том числе изменение устава), — всеми участниками.
  </p>` +
      meetingSign(),
  },
  {
    id: "protocol-annual-report",
    name: "Протокол об утверждении годовой отчётности ООО",
    category: "business",
    actSource: "ст. 33, 34, 37 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Протокол очередного общего собрания участников ООО об утверждении годового отчёта и бухгалтерской (финансовой) отчётности, распределении чистой прибыли. Очередное собрание проводится не ранее чем через два месяца и не позднее чем через четыре месяца после окончания финансового года (ст. 34 ФЗ-14).",
    suggestedDocs: ["llc-meeting-minutes", "sole-member-decision", "protocol-absentee-voting"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата собрания", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "report_period", label: "Отчётный период", type: "text", defaultValue: "2026 год", category: "contract" },
      { id: "profit_amount", label: "Чистая прибыль к распределению (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "chairman_fio", label: "Председатель собрания (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "secretary_fio", label: "Секретарь собрания (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Протокол об утверждении годовой отчётности") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Собрание проведено в соответствии со ст. 34–37 ФЗ-14 «Об ООО». Отчётный период: {{report_period}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Повестка дня и решения</div>
  <p class="mb-4 text-justify">1. Утвердить годовой отчёт Общества за {{report_period}}.</p>
  <p class="mb-4 text-justify">2. Утвердить бухгалтерскую (финансовую) отчётность Общества за {{report_period}}.</p>
  <p class="mb-4 text-justify">3. Распределить чистую прибыль в сумме <strong>{{profit_amount}} ({{profit_amount_words}})</strong> рублей пропорционально долям участников; часть прибыли направить на развитие Общества.</p>` +
      meetingSign(),
  },
  {
    id: "participants-list",
    name: "Список участников ООО",
    category: "business",
    actSource: "ст. 31.1 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Список участников общества — документ, подтверждающий права на доли. Ведение списка с обязательными сведениями обеспечивает общество; с 2018 года сведения о долях также отражаются в ЕГРЮЛ (ст. 31.1 ФЗ-14).",
    suggestedDocs: ["charter-llc", "decision-admit-member", "sole-member-decision"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_inn", label: "ИНН общества", type: "text", defaultValue: "", category: "business" },
      { id: "member1", label: "Участник 1 (ФИО, размер доли %)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "member2", label: "Участник 2 (ФИО, размер доли %)", type: "text", defaultValue: "", category: "business" },
      { id: "member3", label: "Участник 3 (ФИО, размер доли %)", type: "text", defaultValue: "", category: "business" },
      { id: "director_fio", label: "Генеральный директор (ФИО)", type: "text", defaultValue: "", category: "representative" },
    ],
    previewTemplate:
      pageShell("Список участников общества") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Список составлен по состоянию на «{{date}}» в соответствии со ст. 31.1 ФЗ-14 «Об ООО» и содержит сведения об участниках Общества и размерах их долей в уставном капитале.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Участники и размеры долей</div>
  <p class="mb-3 text-justify">1. {{member1}}.</p>
  {{#member2}}<p class="mb-3 text-justify">2. {{member2}}.</p>{{/member2}}
  {{#member3}}<p class="mb-3 text-justify">3. {{member3}}.</p>{{/member3}}
  <p class="mb-4 text-justify">
    Сведения о размерах долей, их номинальной стоимости и обременениях соответствуют данным ЕГРЮЛ. Доли оплачены полностью.
  </p>` +
      decisionSign("Генеральный директор", "director_fio"),
  },
  {
    id: "ballot-voting",
    name: "Бюллетень для голосования на общем собрании ООО",
    category: "business",
    actSource: "ст. 37, 38 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Бюллетень (опросный лист) для голосования на общем собрании участников ООО, в том числе при заочной форме. Содержит вопросы повестки и варианты голосования «за / против / воздержался»; подписывается участником.",
    suggestedDocs: ["protocol-absentee-voting", "llc-meeting-minutes", "participants-list"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата голосования", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "member_fio", label: "Участник (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "share_size", label: "Размер доли (%, число голосов)", type: "text", defaultValue: "", category: "business" },
      { id: "agenda", label: "Вопрос повестки дня", type: "textarea", defaultValue: "", category: "business", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Бюллетень для голосования") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Участник: <strong>{{member_fio}}</strong>{{#share_size}}, доля {{share_size}}{{/share_size}}. Дата голосования: «{{date}}».
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Вопрос повестки дня</div>
  <p class="mb-4 text-justify">{{agenda}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Варианты голосования</div>
  <p class="mb-4 text-justify">
    ☐ «За»&nbsp;&nbsp;&nbsp;☐ «Против»&nbsp;&nbsp;&nbsp;☐ «Воздержался»
  </p>
  <p class="mb-4 text-justify">
    Бюллетень заполняется собственноручно, подписывается участником и представляется обществу в установленный срок. Голос учитывается по числу принадлежащих участнику голосов.
  </p>` +
      decisionSign("Участник", "member_fio"),
  },
  {
    id: "member-exit-app",
    name: "Заявление участника о выходе из ООО",
    category: "business",
    actSource: "ст. 26 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление участника о выходе из общества путём отчуждения доли обществу. Выход допускается, если это предусмотрено уставом; доля переходит к обществу с даты получения заявления, а участник вправе получить действительную стоимость доли.",
    suggestedDocs: ["participants-list", "charter-llc", "decision-decrease-capital"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата заявления", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "company_address", label: "Адрес общества", type: "text", defaultValue: "", category: "business" },
      { id: "member_fio", label: "Участник (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "share_size", label: "Размер доли (руб. / %)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "payout_account", label: "Реквизиты для выплаты действительной стоимости доли", type: "text", defaultValue: "", category: "payment" },
    ],
    previewTemplate:
      pageShell("Заявление о выходе из общества") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Я, участник Общества <strong>{{member_fio}}</strong>, владеющий долей {{share_size}} в уставном капитале,
    на основании ст. 26 Федерального закона от 08.02.1998 № 14-ФЗ «Об обществах с ограниченной ответственностью» заявляю о выходе из Общества
    путём отчуждения доли Обществу.
  </p>
  <p class="mb-4 text-justify">
    1. С момента получения настоящего заявления Обществом моя доля переходит к Обществу.
  </p>
  <p class="mb-4 text-justify">
    2. Прошу выплатить мне действительную стоимость доли, определённую на основании данных бухгалтерской отчётности Общества за последний отчётный период{{#payout_account}}, по следующим реквизитам: {{payout_account}}{{/payout_account}}.
  </p>
  <p class="mb-4 text-justify">
    3. Общество обязано выплатить действительную стоимость доли или с согласия участника выдать имущество в натуре в течение трёх месяцев со дня возникновения соответствующей обязанности (п. 6.1 ст. 23 ФЗ-14).
  </p>` +
      decisionSign("Участник", "member_fio"),
  },
  {
    id: "share-sale-notice",
    name: "Уведомление о продаже доли в уставном капитале ООО",
    category: "business",
    actSource: "ст. 21 ФЗ-14 «Об ООО»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Уведомление участника общества о намерении продать свою долю (часть доли) третьему лицу. Другие участники имеют преимущественное право покупки по цене предложения в течение установленного уставом срока, но не менее 30 дней.",
    suggestedDocs: ["llc-share-purchase", "charter-llc", "participants-list"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата уведомления", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Общество (полное наименование)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "seller_fio", label: "Продавец доли (ФИО)", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "share_size", label: "Размер отчуждаемой доли", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "price", label: "Цена предложения (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "buyer_name", label: "Покупатель (ФИО/наименование)", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Уведомление о продаже доли") +
      companyLine() +
      `
  <p class="mb-4 text-justify">
    Настоящим участник <strong>{{seller_fio}}</strong> уведомляет о намерении продать принадлежащую ему долю {{share_size}} в уставном капитале Общества третьему лицу{{#buyer_name}} — {{buyer_name}}{{/buyer_name}} по цене
    <strong>{{price}} ({{price_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    В соответствии с п. 4 ст. 21 ФЗ-14 «Об ООО» другие участники Общества имеют преимущественное право покупки отчуждаемой доли по цене предложения третьему лицу.
  </p>
  <p class="mb-4 text-justify">
    Прошу сообщить о решении воспользоваться преимущественным правом в срок, установленный уставом Общества (не менее 30 дней), в письменной форме.
  </p>` +
      decisionSign("Участник", "seller_fio"),
  },
];