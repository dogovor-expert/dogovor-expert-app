import type { LegalTemplate } from "../types";
import {
  sideFields,
  sideBlock,
  pairIntro,
  pairSign,
  commonClauses,
  pageShell,
} from "./parts";

export const TEMPLATES_HR: LegalTemplate[] = [
  {
    id: "job-description",
    name: "Должностная инструкция",
    category: "business",
    actSource: "ТК РФ (ст. 57, 68)",
    lastUpdated: "Август 2026",
    description:
      "Должностная инструкция работника: обязанности, права, ответственность, квалификационные требования. Оформляется как приложение к трудовому договору или самостоятельный документ.",
    suggestedDocs: ["employment-contract", "hire-order", "internal-rules"],
    printInstruction:
      "Инструкция не обязательна по ТК РФ, но рекомендуется: она конкретизирует трудовую функцию (ст. 57 ТК РФ). Работник должен быть ознакомлен с инструкцией под роспись (ст. 68 ТК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата утверждения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "division", label: "Структурное подразделение", type: "text", defaultValue: "", category: "employer" },
      { id: "boss_position", label: "Непосредственный руководитель (должность)", type: "text", defaultValue: "", category: "employer" },
      { id: "requirements", label: "Квалификационные требования (образование, опыт)", type: "textarea", defaultValue: "высшее (среднее профессиональное) образование, опыт работы по специальности", category: "employee" },
      { id: "duties", label: "Должностные обязанности", type: "textarea", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "knows", label: "Работник должен знать", type: "textarea", defaultValue: "законодательство, локальные нормативные акты организации, должностную инструкцию", category: "employee" },
    ],
    previewTemplate:
      pageShell("Должностная инструкция") +
      `
  <p class="mb-4 text-justify"><strong>{{company}}</strong></p>
  <p class="mb-2 text-justify">УТВЕРЖДАЮ</p>
  <p class="mb-4 text-justify">Генеральный директор {{company}} ____________________ /_______________/</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">
    1.1. Настоящая должностная инструкция определяет должностные обязанности, права и ответственность работника, занимающего должность <strong>{{position}}</strong>.
  </p>
  {{#division}}<p class="mb-4 text-justify">1.2. Работник относится к структурному подразделению: {{division}}.</p>{{/division}}
  {{#boss_position}}<p class="mb-4 text-justify">1.3. Непосредственный руководитель: {{boss_position}}.</p>{{/boss_position}}
  <p class="mb-4 text-justify">1.4. Назначение на должность и освобождение от должности производится приказом руководителя организации.</p>
  <p class="mb-4 text-justify">1.5. Квалификационные требования: {{requirements}}.</p>
  <p class="mb-4 text-justify">1.6. Работник должен знать: {{knows}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Должностные обязанности</div>
  <p class="mb-4 text-justify">2.1. Работник обязан: {{duties}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права</div>
  <p class="mb-4 text-justify">
    3.1. Работник имеет право: знакомиться с проектами решений руководителя, касающимися его деятельности; вносить на рассмотрение руководителя предложения по улучшению работы;
    получать информацию и документы, необходимые для выполнения обязанностей; требовать содействия руководителя в исполнении должностных обязанностей;
    повышать квалификацию; иные права, предусмотренные трудовым законодательством.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность</div>
  <p class="mb-4 text-justify">
    4.1. Работник несёт ответственность за неисполнение (ненадлежащее исполнение) должностных обязанностей, предусмотренных настоящей инструкцией, в пределах,
    установленных действующим трудовым законодательством РФ.
  </p>
  <p class="mb-4 text-justify">
    4.2. Работник несёт ответственность за правонарушения, совершённые в процессе своей деятельности, в пределах, установленных действующим законодательством РФ.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ознакомление</div>
  <p class="mb-4 text-justify">
    5.1. С настоящей должностной инструкцией работник ознакомлен: ____________________ /_______________/ «___» ____________ 20___ г.
  </p>`
      + commonClauses() +
      `</div>`,
  },
  {
    id: "director-contract",
    name: "Трудовой договор с директором",
    category: "business",
    actSource: "ТК РФ (ст. 273–281)",
    lastUpdated: "Август 2026",
    description:
      "Трудовой договор с руководителем организации (единоличным исполнительным органом): полномочия, ответственность, испытательный срок до 6 месяцев, основания увольнения.",
    suggestedDocs: ["employment-contract", "liability-agreement", "termination-agreement"],
    printInstruction:
      "Директор назначается решением учредителя (участников, совета директоров). Директор несёт полную материальную ответственность за ущерб (ст. 277 ТК РФ). Печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("employer", "Работодатель", "employer"),
      ...sideFields("director", "Работник (директор)", "employee"),
      { id: "company", label: "Наименование организации", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "appointment_basis", label: "Основание назначения (решение учредителя, протокол общего собрания)", type: "text", defaultValue: "решение единственного участника", category: "employer", validation: { required: true } },
      { id: "salary", label: "Оклад (руб. в месяц)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "worktime", label: "Режим рабочего времени", type: "text", defaultValue: "ненормированный рабочий день", category: "contract" },
      { id: "trial_months", label: "Испытательный срок (мес., до 6)", type: "number", defaultValue: "6", category: "contract" },
      { id: "contract_type", label: "Срок договора", type: "radio", defaultValue: "open", category: "contract",
        options: [
          { label: "Бессрочный", value: "open" },
          { label: "Срочный (указать срок)", value: "fixed" },
        ] },
      { id: "term_until", label: "Срок действия (до даты)", type: "date", defaultValue: "", category: "contract",
        dependsOn: [{ fieldId: "contract_type", value: "fixed" }] },
    ],
    previewTemplate:
      pageShell("Трудовой договор с директором") +
      `
  <p class="mb-4 text-justify">
    {{company}}, именуемое в дальнейшем «Работодатель», в лице ____________________________________________________________________,
    действующего на основании ____________________________, с одной стороны, и гражданин(-ка) РФ <strong>{{director_name}}</strong>,
    именуемый(ая) в дальнейшем «Работник», с другой стороны, заключили настоящий трудовой договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">
    1.1. Работник назначается на должность <strong>генерального директора (директора)</strong> {{company}} на основании {{appointment_basis}}.
  </p>
  <p class="mb-4 text-justify">
    1.2. Настоящий договор является договором по основной работе. {{#contract_type_is_fixed}}Договор заключён на определённый срок до «{{term_until}}» (ст. 275 ТК РФ).{{/contract_type_is_fixed}}
    {{#contract_type_is_open}}Договор заключён на неопределённый срок (ст. 275 ТК РФ).{{/contract_type_is_open}}
  </p>
  <p class="mb-4 text-justify">
    1.3. Работнику устанавливается испытательный срок продолжительностью <strong>{{trial_months}}</strong> месяцев (ст. 70 ТК РФ — для руководителей до 6 месяцев).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Права и обязанности Работника</div>
  <p class="mb-4 text-justify">
    2.1. Работник осуществляет руководство текущей деятельностью организации, действует без доверенности от имени организации,
    представляет её интересы, совершает сделки, издаёт приказы и даёт указания, обязательные для работников организации.
  </p>
  <p class="mb-4 text-justify">
    2.2. Работник обязан добросовестно выполнять свои обязанности, соблюдать трудовую дисциплину, требования охраны труда и локальные нормативные акты.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности Работодателя</div>
  <p class="mb-4 text-justify">
    3.1. Работодатель вправе поощрять Работника, привлекать к дисциплинарной и материальной ответственности в порядке, установленном ТК РФ.
  </p>
  <p class="mb-4 text-justify">
    3.2. Работодатель обязан предоставить Работнику работу, выплачивать заработную плату, обеспечивать условия труда, предусмотренные законодательством.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Оплата труда</div>
  <p class="mb-4 text-justify">
    4.1. Работнику устанавливается должностной оклад в размере <strong>{{salary}} ({{salary_words}})</strong> рублей в месяц.
    Выплата заработной платы производится не реже чем каждые полмесяца.
  </p>
  <p class="mb-4 text-justify">
    4.2. Режим рабочего времени: {{worktime}}; ежегодный основной оплачиваемый отпуск — 28 календарных дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность</div>
  <p class="mb-4 text-justify">
    5.1. Работник несёт полную материальную ответственность за прямой действительный ущерб, причинённый организации (ст. 277 ТК РФ).
  </p>
  <p class="mb-4 text-justify">
    5.2. Работник несёт ответственность за нарушение трудовой дисциплины в порядке, предусмотренном ТК РФ.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">6. Расторжение договора</div>
  <p class="mb-4 text-justify">
    6.1. Договор может быть расторгнут по основаниям, предусмотренным ТК РФ, в том числе в связи с принятием уполномоченным органом решения о досрочном прекращении полномочий Работника (п. 2 ст. 278 ТК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">7. Стороны договора</div>
  <p class="mb-2">Работодатель:</p>
  <p class="mb-1 text-sm"><strong>{{company}}</strong></p>
  <p class="text-xs mb-0.5">{{employer_address}}</p>
  <p class="text-xs mb-0.5">ИНН: {{employer_inn}}</p>
  <p class="mb-2 mt-4">Работник:</p>
  ${sideBlock("director", "Работник")}`
      + commonClauses() +
      pairSign("employer", "Работодатель", "director", "Работник"),
  },
  {
    id: "foreign-employee-contract",
    name: "Трудовой договор с иностранным гражданином",
    category: "business",
    actSource: "ТК РФ (ст. 327.1–327.7), 115-ФЗ",
    lastUpdated: "Август 2026",
    description:
      "Трудовой договор с иностранным работником: патент или разрешение на работу, медосмотр, полис ДМС, уведомление МВД о заключении договора.",
    suggestedDocs: ["employment-contract", "foreign-employee-reg", "pdn-policy"],
    printInstruction:
      "Уведомить МВД о заключении трудового договора с иностранцем — в течение 3 рабочих дней (ст. 13 115-ФЗ). Обязательны медосмотр (ст. 327.3 ТК РФ) и полис ДМС или договор с медорганизацией (ст. 327.2 ТК РФ).",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("employer", "Работодатель", "employer"),
      ...sideFields("employee", "Работник (иностранец)", "employee"),
      { id: "employee_foreign_passport", label: "Загранпаспорт / документ иностранца (серия, номер)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_country", label: "Гражданство (страна)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "work_basis", label: "Основание работы в РФ", type: "radio", defaultValue: "patent", category: "contract",
        options: [
          { label: "Патент (безвизовый режим)", value: "patent" },
          { label: "Разрешение на работу (визовый режим)", value: "work_permit" },
        ] },
      { id: "patent_series", label: "Патент: серия и номер", type: "text", defaultValue: "", category: "employee",
        dependsOn: [{ fieldId: "work_basis", value: "patent" }] },
      { id: "patent_valid", label: "Патент: срок действия (до даты)", type: "date", defaultValue: "", category: "employee",
        dependsOn: [{ fieldId: "work_basis", value: "patent" }] },
      { id: "permit_series", label: "Разрешение на работу: серия и номер", type: "text", defaultValue: "", category: "employee",
        dependsOn: [{ fieldId: "work_basis", value: "work_permit" }] },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "salary", label: "Оклад (руб. в месяц)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "dms", label: "Полис ДМС / договор с медорганизацией", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Трудовой договор с иностранным гражданином") +
      `
  <p class="mb-4 text-justify">
    {{employer_name}}, именуемое в дальнейшем «Работодатель», {{#employer_rep}}в лице {{employer_rep}}, действующего на основании {{employer_basis}},{{/employer_rep}}
    с одной стороны, и гражданин(-ка) <strong>{{employee_country}}</strong> <strong>{{employee_name}}</strong>,
    документ, удостоверяющий личность: {{employee_passport}}, именуемый(ая) в дальнейшем «Работник», с другой стороны, заключили настоящий трудовой договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">1.1. Работник принимается на работу на должность <strong>{{position}}</strong>.</p>
  <p class="mb-4 text-justify">
    1.2. Работник осуществляет трудовую деятельность в РФ на основании:
    {{#work_basis_is_patent}}патента серия {{patent_series}}, срок действия до «{{patent_valid}}» (ст. 327.1 ТК РФ, 115-ФЗ).{{/work_basis_is_patent}}
    {{#work_basis_is_work_permit}}разрешения на работу {{permit_series}} (ст. 327.1 ТК РФ, 115-ФЗ).{{/work_basis_is_work_permit}}
  </p>
  <p class="mb-4 text-justify">
    1.3. Работник обязан уведомлять Работодателя об изменениях сведений о документе, подтверждающем право на осуществление трудовой деятельности.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Медицинское обеспечение</div>
  <p class="mb-4 text-justify">
    2.1. Работник прошёл обязательный предварительный медицинский осмотр (ст. 327.3 ТК РФ).
  </p>
  <p class="mb-4 text-justify">
    2.2. Работнику оформлен полис ДМС (договор с медицинской организацией): {{dms}} (ст. 327.2 ТК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Оплата труда и режим работы</div>
  <p class="mb-4 text-justify">
    3.1. Работнику устанавливается должностной оклад <strong>{{salary}} ({{salary_words}})</strong> рублей в месяц; заработная плата выплачивается не реже чем каждые полмесяца.
  </p>
  <p class="mb-4 text-justify">
    3.2. Режим рабочего времени — в соответствии с правилами внутреннего трудового распорядка. Ежегодный отпуск — 28 календарных дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Уведомление МВД</div>
  <p class="mb-4 text-justify">
    4.1. Работодатель обязуется уведомить территориальный орган МВД России о заключении (прекращении) настоящего договора в течение 3 рабочих дней (ст. 13 115-ФЗ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны договора</div>
  <p class="mb-2">Работодатель:</p>
  ${sideBlock("employer", "Работодатель")}
  <p class="mb-2 mt-4">Работник:</p>
  ${sideBlock("employee", "Работник")}
  <p class="text-xs mt-2">Документ, удостоверяющий личность: {{employee_foreign_passport}}</p>`
      + commonClauses() +
      pairSign("employer", "Работодатель", "employee", "Работник"),
  },
  {
    id: "internal-rules",
    name: "Правила внутреннего трудового распорядка",
    category: "business",
    actSource: "ТК РФ (ст. 189–190)",
    lastUpdated: "Август 2026",
    description:
      "ПВТР: режим рабочего времени и отдыха, порядок приёма и увольнения, дисциплина труда, поощрения и взыскания. Утверждаются работодателем с учётом мнения профсоюза.",
    suggestedDocs: ["employment-contract", "job-description", "termination-agreement"],
    printInstruction:
      "ПВТР — локальный нормативный акт (ст. 189 ТК РФ). Все работники должны быть ознакомлены с правилами под роспись при приёме на работу (ст. 68 ТК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата утверждения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "work_start", label: "Начало рабочего дня", type: "text", defaultValue: "09:00", category: "contract" },
      { id: "work_end", label: "Окончание рабочего дня", type: "text", defaultValue: "18:00", category: "contract" },
      { id: "lunch_start", label: "Обеденный перерыв (начало)", type: "text", defaultValue: "13:00", category: "contract" },
      { id: "lunch_end", label: "Обеденный перерыв (конец)", type: "text", defaultValue: "14:00", category: "contract" },
      { id: "work_week", label: "Рабочая неделя", type: "text", defaultValue: "пятидневная с двумя выходными днями (суббота, воскресенье)", category: "contract" },
      { id: "vacation_days", label: "Ежегодный оплачиваемый отпуск (дней)", type: "number", defaultValue: "28", category: "contract" },
      { id: "salary_days", label: "Дни выплаты зарплаты (аванс / расчёт)", type: "text", defaultValue: "20-го и 5-го числа каждого месяца", category: "payment" },
    ],
    previewTemplate:
      pageShell("Правила внутреннего трудового распорядка") +
      `
  <p class="mb-2 text-justify"><strong>{{company}}</strong></p>
  <p class="mb-4 text-justify">УТВЕРЖДЕНО приказом от «{{date}}»</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">
    1.1. Правила внутреннего трудового распорядка (далее — Правила) разработаны в соответствии со ст. 189, 190 ТК РФ и регулируют
    порядок приёма и увольнения работников, режим рабочего времени и времени отдыха, применяемые к работникам поощрения и взыскания {{company}}.
  </p>
  <p class="mb-4 text-justify">1.2. Правила обязательны для всех работников организации.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок приёма и увольнения</div>
  <p class="mb-4 text-justify">
    2.1. Приём на работу оформляется трудовым договором и приказом. До подписания договора работодатель знакомит работника под роспись
    с Правилами, должностной инструкцией, иными локальными актами (ст. 68 ТК РФ).
  </p>
  <p class="mb-4 text-justify">
    2.2. Расторжение трудового договора оформляется приказом (распоряжением) работодателя по основаниям, предусмотренным ТК РФ.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Режим рабочего времени и времени отдыха</div>
  <p class="mb-4 text-justify">
    3.1. Устанавливается {{work_week}}. Начало рабочего дня — {{work_start}}, окончание — {{work_end}}.
  </p>
  <p class="mb-4 text-justify">
    3.2. В течение рабочего дня работнику предоставляется перерыв для отдыха и питания с {{lunch_start}} до {{lunch_end}}, который в рабочее время не включается.
  </p>
  <p class="mb-4 text-justify">
    3.3. Работникам предоставляется ежегодный основной оплачиваемый отпуск продолжительностью {{vacation_days}} календарных дней (ст. 115 ТК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Оплата труда</div>
  <p class="mb-4 text-justify">
    4.1. Заработная плата выплачивается: {{salary_days}} (ст. 136 ТК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Дисциплина труда, поощрения и взыскания</div>
  <p class="mb-4 text-justify">
    5.1. За добросовестное исполнение обязанностей применяются поощрения: объявление благодарности, выдача премии, награждение ценным подарком (ст. 191 ТК РФ).
  </p>
  <p class="mb-4 text-justify">
    5.2. За совершение дисциплинарного проступка применяются взыскания: замечание, выговор, увольнение по соответствующим основаниям (ст. 192 ТК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">6. Охрана труда</div>
  <p class="mb-4 text-justify">
    6.1. Работники обязаны соблюдать требования охраны труда и пожарной безопасности, проходить инструктажи и медицинские осмотры в установленном порядке.
  </p>`
      + commonClauses() +
      `</div>`,
  },
  {
    id: "termination-employment",
    name: "Соглашение о расторжении трудового договора",
    category: "business",
    actSource: "ТК РФ (ст. 78, п. 1 ч. 1 ст. 77)",
    lastUpdated: "Август 2026",
    description:
      "Расторжение трудового договора по соглашению сторон: дата увольнения, выплаты и компенсации, отсутствие взаимных претензий.",
    suggestedDocs: ["firing-order", "employment-contract", "ds-services"],
    printInstruction:
      "Соглашение подписывают обе стороны (ст. 78 ТК РФ). Аннулирование соглашения возможно только при взаимном согласии (п. 20 Постановления Пленума ВС РФ № 2).",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата соглашения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("employer", "Работодатель", "employer"),
      ...sideFields("employee", "Работник", "employee"),
      { id: "contract_date", label: "Дата трудового договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "position", label: "Должность работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "last_workday", label: "Последний рабочий день (дата увольнения)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "compensation", label: "Компенсация работнику (руб.)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate:
      pageShell("Соглашение о расторжении трудового договора") +
      `
  <p class="mb-4 text-justify">
    {{employer_name}}, именуемое в дальнейшем «Работодатель», {{#employer_rep}}в лице {{employer_rep}}, действующего на основании {{employer_basis}},{{/employer_rep}}
    с одной стороны, и <strong>{{employee_name}}</strong>, именуемый(ая) в дальнейшем «Работник», с другой стороны,
    заключили настоящее соглашение о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Расторжение договора</div>
  <p class="mb-4 text-justify">
    1.1. Стороны пришли к соглашению о расторжении трудового договора от «{{contract_date}}», заключённого между ними,
    по основанию, предусмотренному п. 1 ч. 1 ст. 77 ТК РФ (соглашение сторон, ст. 78 ТК РФ).
  </p>
  <p class="mb-4 text-justify">
    1.2. Последним рабочим днём Работника является «{{last_workday}}». В указанный день Работодатель выдаёт Работнику трудовую книжку
    (сведения о трудовой деятельности) и производит окончательный расчёт.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Выплаты</div>
  <p class="mb-4 text-justify">
    2.1. Работодатель выплачивает Работнику заработную плату за отработанное время и компенсацию за неиспользованный отпуск.
  </p>
  {{#compensation}}<p class="mb-4 text-justify">
    2.2. Дополнительно Работодатель выплачивает Работнику компенсацию в размере <strong>{{compensation}} ({{compensation_words}})</strong> рублей.
  </p>{{/compensation}}
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Отсутствие претензий</div>
  <p class="mb-4 text-justify">
    3.1. Стороны не имеют друг к другу материальных и иных претензий, связанных с трудовыми отношениями.
  </p>
  <p class="mb-4 text-justify">
    3.2. Настоящее соглашение является основанием для издания приказа (распоряжения) о прекращении трудового договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Стороны</div>
  <p class="mb-2">Работодатель:</p>
  ${sideBlock("employer", "Работодатель")}
  <p class="mb-2 mt-4">Работник:</p>
  ${sideBlock("employee", "Работник")}`
      + commonClauses() +
      pairSign("employer", "Работодатель", "employee", "Работник"),
  },
  {
    id: "pdn-policy",
    name: "Положение о защите персональных данных",
    category: "business",
    actSource: "152-ФЗ, ст. 86–90 ТК РФ",
    lastUpdated: "Август 2026",
    description:
      "Положение об обработке и защите персональных данных работников и клиентов: перечень данных, правовые основания, порядок сбора, хранения и уничтожения, ответственный за ПДн.",
    suggestedDocs: ["personal-data-consent", "internal-rules", "job-description"],
    printInstruction:
      "Положение о ПДн — обязательный локальный акт для операторов ПДн (152-ФЗ). Уведомите Роскомнадзор об обработке ПДн, назначьте ответственного (ст. 22.1 152-ФЗ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата утверждения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация (оператор)", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "responsible", label: "Ответственный за организацию обработки ПДн (ФИО, должность)", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "data_list", label: "Перечень обрабатываемых ПДн", type: "textarea", defaultValue: "фамилия, имя, отчество; дата и место рождения; паспортные данные; адрес регистрации; ИНН, СНИЛС; образование; сведения о трудовой деятельности; банковские реквизиты", category: "employer" },
      { id: "storage_period", label: "Срок хранения ПДн", type: "text", defaultValue: "в течение сроков, установленных законодательством (не менее 75 лет для трудовых документов)", category: "contract" },
      { id: "transfer_third", label: "Передача ПДн третьим лицам", type: "text", defaultValue: "в СФР, ФНС, военкомат и иные органы в случаях, установленных законом; иным лицам — с согласия субъекта", category: "contract" },
    ],
    previewTemplate:
      pageShell("Положение о защите персональных данных") +
      `
  <p class="mb-2 text-justify"><strong>{{company}}</strong></p>
  <p class="mb-4 text-justify">УТВЕРЖДЕНО приказом от «{{date}}»</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">
    1.1. Настоящее Положение разработано в соответствии с Конституцией РФ, Трудовым кодексом РФ, Федеральным законом от 27.07.2006 № 152-ФЗ
    «О персональных данных» и определяет порядок обработки и защиты персональных данных (далее — ПДн) в {{company}}.
  </p>
  <p class="mb-4 text-justify">
    1.2. {{company}} является оператором ПДн и обеспечивает их конфиденциальность, целостность и законность обработки.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Перечень и основания обработки</div>
  <p class="mb-4 text-justify">
    2.1. Обрабатываются следующие ПДн: {{data_list}}.
  </p>
  <p class="mb-4 text-justify">
    2.2. Правовые основания обработки: трудовые договоры, гражданско-правовые договоры, согласия субъектов ПДн, федеральные законы.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Порядок обработки</div>
  <p class="mb-4 text-justify">
    3.1. Обработка ПДн осуществляется с соблюдением принципов законности, минимизации данных, точности и достаточности (ст. 5 152-ФЗ).
  </p>
  <p class="mb-4 text-justify">
    3.2. Срок хранения ПДн: {{storage_period}}. По истечении сроков хранения ПДн уничтожаются либо обезличиваются.
  </p>
  <p class="mb-4 text-justify">
    3.3. Передача ПДн третьим лицам: {{transfer_third}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственный за обработку ПДн</div>
  <p class="mb-4 text-justify">
    4.1. Ответственным за организацию обработки ПДн назначен(а): {{responsible}} (ст. 22.1 152-ФЗ).
  </p>
  <p class="mb-4 text-justify">
    4.2. Ответственный обеспечивает: контроль за обработкой ПДн, инструктаж работников, взаимодействие с Роскомнадзором и субъектами ПДн.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Защита ПДн</div>
  <p class="mb-4 text-justify">
    5.1. {{company}} принимает правовые, организационные и технические меры защиты ПДн: назначение ответственного, разграничение доступа,
    парольная и антивирусная защита, резервное копирование (ст. 19 152-ФЗ).
  </p>
  <p class="mb-4 text-justify">
    5.2. Работники, имеющие доступ к ПДн, обязаны соблюдать конфиденциальность; за нарушение предусмотрена дисциплинарная, административная и иная ответственность.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">6. Права субъектов ПДн</div>
  <p class="mb-4 text-justify">
    6.1. Субъекты ПДн вправе получать сведения об обработке своих ПДн, требовать их уточнения, блокирования или уничтожения (ст. 14 152-ФЗ),
    а также отозвать согласие на обработку ПДн.
  </p>`
      + commonClauses() +
      `</div>`,
  },
  {
    id: "internship-contract",
    name: "Договор со стажёром",
    category: "business",
    actSource: "ст. 351.9 ТК РФ (Федеральный закон от 01.03.2027 № 246-ФЗ)",
    lastUpdated: "Август 2026",
    description:
      "Трудовой договор со стажёром по ст. 351.9 ТК РФ (введена 246-ФЗ, вступает в силу с 01.03.2027). Срок стажировки не может превышать 6 месяцев. До 01.03.2027 шаблон носит превентивный характер.",
    suggestedDocs: ["employment-contract", "personal-data-consent", "internal-rules"],
    printInstruction:
      "Стажёру назначается наставник (ст. 351.9 ТК РФ). Испытательный срок к договору со стажёром не применяется. Срок договора — не более 6 месяцев.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("employer", "Работодатель", "employer"),
      { id: "intern_fio", label: "ФИО стажёра", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "intern_passport", label: "Паспорт стажёра", type: "text", defaultValue: "", category: "employee" },
      { id: "intern_address", label: "Адрес стажёра", type: "text", defaultValue: "", category: "employee" },
      { id: "intern_phone", label: "Телефон стажёра", type: "text", defaultValue: "", category: "employee" },
      { id: "term_months", label: "Срок стажировки (месяцев, не более 6)", type: "number", defaultValue: "", category: "contract", validation: { required: true }, hint: "ст. 351.9 ТК РФ: срок договора со стажёром не может превышать 6 месяцев" },
      { id: "start_date", label: "Дата начала стажировки", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "position", label: "Должность / направление стажировки", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "mentor_fio", label: "ФИО наставника", type: "text", defaultValue: "", category: "employer", validation: { required: true }, hint: "Обязательное назначение наставника для стажёра" },
      { id: "salary", label: "Размер стипендии / оплаты (₽, если оплачиваемая)", type: "number", defaultValue: "", category: "payment" },
      { id: "work_schedule", label: "График стажировки", type: "select", defaultValue: "Полный день", category: "contract",
        options: [
          { label: "Полный день", value: "Полный день" },
          { label: "Неполный рабочий день", value: "Неполный рабочий день" },
          { label: "Удалённо", value: "Удалённо" },
        ] },
    ],
    previewTemplate:
      pageShell("Договор со стажёром") +
      `
   <p class="mb-4 text-justify">
     {{#employer_status_is_person}}Гражданин(-ка) РФ <strong>{{employer_name}}</strong>{{/employer_status_is_person}}
     {{#employer_status_is_ip}}Индивидуальный предприниматель <strong>{{employer_name}}</strong>{{/employer_status_is_ip}}
     {{#employer_status_is_legal}}<strong>{{employer_name}}</strong>{{/employer_status_is_legal}}
     {{#employer_status_is_legal}}{{#employer_rep}}в лице {{employer_rep}}, действующего на основании {{employer_basis}},{{/employer_rep}}{{/employer_status_is_legal}}
     {{#employer_inn}}ИНН {{employer_inn}},{{/employer_inn}} именуемый(ая) в дальнейшем «Работодатель», с одной стороны, и гражданин(ка) РФ <strong>{{intern_fio}}</strong>, именуемый(ая) в дальнейшем «Стажёр», с другой стороны, заключили настоящий договор о нижеследующем:
   </p>
   <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
   <p class="mb-4 text-justify">
     1.1. Стажёр принимается на должность <strong>{{position}}</strong> для прохождения стажировки. Руководство стажировкой поручается наставнику — {{mentor_fio}}.
   </p>
   <p class="mb-4 text-justify">
     1.2. Настоящий договор заключён на срок <strong>{{term_months}}</strong> месяцев (ст. 351.9 ТК РФ — срок договора со стажёром не может превышать 6 месяцев) и вступает в силу с «{{start_date}}».
   </p>
   <p class="mb-4 text-justify">
     1.3. График стажировки: {{work_schedule}}. {{#salary}}Стажировка оплачиваемая, размер выплаты: {{salary}} руб.{{/salary}}{{^salary}}Стажировка неоплачиваемая.{{/salary}}
   </p>
   <div class="font-bold mb-2 text-black text-xs uppercase">2. Права и обязанности Стажёра</div>
   <p class="mb-4 text-justify">
     2.1. Стажёр обязан добросовестно проходить стажировку, соблюдать правила внутреннего трудового распорядка и выполнять указания наставника. К Стажёру не применяется испытательный срок (ст. 351.9 ТК РФ).
   </p>
   <div class="font-bold mb-2 text-black text-xs uppercase">3. Персональные данные</div>
   <p class="mb-4 text-justify">
     3.1. Обработка персональных данных Стажёра (паспорт: {{intern_passport}}{{#intern_address}}; адрес: {{intern_address}}{{/intern_address}}) осуществляется в соответствии с законодательством РФ о персональных данных.
   </p>`
      + commonClauses() +
      `
   <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
     <div>
       <div class="font-bold mb-1 uppercase text-black">Работодатель:</div>
       {{#employer_status_is_person}}<p class="mb-1"><strong>{{employer_name}}</strong></p>{{/employer_status_is_person}}
       {{#employer_status_is_ip}}<p class="mb-1"><strong>ИП {{employer_name}}</strong></p>{{/employer_status_is_ip}}
       {{#employer_status_is_legal}}<p class="mb-1"><strong>{{employer_name}}</strong></p>{{/employer_status_is_legal}}
       {{#employer_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{employer_inn}}</p>{{/employer_inn}}
       {{#employer_address}}<p class="text-zinc-500 text-[11px]">Адрес: {{employer_address}}</p>{{/employer_address}}
       {{#employer_phone}}<p class="text-zinc-500 text-[11px]">Телефон: {{employer_phone}}</p>{{/employer_phone}}
       <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
     </div>
     <div>
       <div class="font-bold mb-1 uppercase text-black">Стажёр:</div>
       <p class="mb-1"><strong>{{intern_fio}}</strong></p>
       {{#intern_passport}}<p class="text-zinc-500 text-[11px]">Паспорт: {{intern_passport}}</p>{{/intern_passport}}
       {{#intern_address}}<p class="text-zinc-500 text-[11px]">Адрес: {{intern_address}}</p>{{/intern_address}}
       {{#intern_phone}}<p class="text-zinc-500 text-[11px]">Телефон: {{intern_phone}}</p>{{/intern_phone}}
       <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
     </div>
   </div>
  </div>`,
  },
];