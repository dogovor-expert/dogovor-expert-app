import type { LegalTemplate } from "../types";
import { pageShell } from "./parts";

const approveBlock = (role = "Руководитель") => `
  <p class="mb-2 text-justify">УТВЕРЖДАЮ</p>
  <p class="mb-6 text-justify">${role} {{company}} ____________________ /{{approve_fio}}/</p>`;

const orderFooter = (nameField = "approve_fio") => `
  <p class="mt-8 mb-2 text-justify">Руководитель {{company}} ____________________ /{{${nameField}}}/</p>
  <p class="mb-4 text-justify">С приказом ознакомлен(а): ____________________ /{{employee_fio}}/ «___» ____________ 20___ г.</p>`;

const actFooter = `
  <p class="mt-8 mb-2 text-justify">Акт составлен:</p>
  <p class="mb-2 text-justify">____________________ /{{witness1}}/</p>
  <p class="mb-2 text-justify">____________________ /{{witness2}}/</p>
  <p class="mb-4 text-justify">С актом ознакомлен(а): ____________________ /{{employee_fio}}/</p>`;



export const TEMPLATES_HR_POLICIES: LegalTemplate[] = [
  {
    id: "staffing-table",
    name: "Штатное расписание (Т-3)",
    category: "business",
    actSource: "Постановление Госкомстата РФ от 05.01.2004 № 1 (форма Т-3)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Штатное расписание организации (унифицированная форма Т-3): перечень структурных подразделений, должностей, количество штатных единиц и оклады.",
    suggestedDocs: ["hire-order", "regulation-pay"],
    printInstruction:
      "Штатное расписание утверждается приказом руководителя. Изменения (введение или сокращение штатных единиц) оформляются отдельным приказом. Заполняйте перечень штатных единиц по одной строке на позицию.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата утверждения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "order_number", label: "Утверждено приказом №", type: "text", defaultValue: "", category: "contract" },
      { id: "order_date", label: "Дата приказа", type: "date", defaultValue: "", category: "contract" },
      { id: "period_from", label: "Вводится в действие с", type: "date", defaultValue: "", category: "contract" },
      { id: "positions", label: "Штатные единицы (по строке: подразделение — должность — кол-во единиц — оклад, руб.)", type: "textarea", defaultValue: "", category: "employee", rows: 8, validation: { required: true } },
      { id: "total_sum", label: "Фонд оплаты труда в месяц (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "chief_fio", label: "Главный бухгалтер (ФИО)", type: "text", defaultValue: "", category: "employee" },
      { id: "hr_fio", label: "Начальник отдела кадров (ФИО)", type: "text", defaultValue: "", category: "employee" },
    ],
    previewTemplate:
      pageShell("Штатное расписание") +
      `
  <p class="mb-4 text-justify">На период с «{{period_from}}». Утверждено приказом № {{order_number}} от «{{order_date}}».</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Структурные подразделения и должности</div>
  <table class="w-full border-collapse text-xs mb-4">
    <tbody>
      <tr>
        <td class="border border-zinc-400 p-2 align-top" style="white-space: pre-line">{{positions}}</td>
      </tr>
    </tbody>
  </table>
  <p class="mb-4 text-justify">Фонд оплаты труда в месяц: <strong>{{total_sum}} ({{total_sum_words}})</strong> рублей.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1 uppercase text-black">Главный бухгалтер</div>
      <p class="mb-1"><strong>{{chief_fio}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1 uppercase text-black">Начальник отдела кадров</div>
      <p class="mb-1"><strong>{{hr_fio}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
  {
    id: "vacation-schedule",
    name: "График отпусков (Т-7)",
    category: "business",
    actSource: "ст. 123 ТК РФ; Постановление Госкомстата РФ от 05.01.2004 № 1 (форма Т-7)",
    lastUpdated: "Сентябрь 2026",
    description:
      "График отпусков на календарный год (унифицированная форма Т-7): очерёдность предоставления ежегодных оплачиваемых отпусков.",
    suggestedDocs: ["vacation-order", "vacation-letter"],
    printInstruction:
      "График отпусков утверждается не позднее чем за две недели до начала календарного года и обязателен как для работника, так и для работодателя (ст. 123 ТК РФ). Заполняйте по строке на работника.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата утверждения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "year", label: "Календарный год", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "approve_fio", label: "Руководитель (ФИО)", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "schedule_rows", label: "Работники (по строке: подразделение — ФИО — должность — кол-во дней — дата начала — дата окончания)", type: "textarea", defaultValue: "", category: "employee", rows: 10, validation: { required: true } },
      { id: "hr_fio", label: "Начальник отдела кадров (ФИО)", type: "text", defaultValue: "", category: "employee" },
    ],
    previewTemplate:
      pageShell("График отпусков") +
      `
  <p class="mb-4 text-justify">График отпусков на {{year}} год. Утверждён приказом руководителя {{company}}.</p>
  <table class="w-full border-collapse text-xs mb-4">
    <tbody>
      <tr>
        <td class="border border-zinc-400 p-2 align-top" style="white-space: pre-line">{{schedule_rows}}</td>
      </tr>
    </tbody>
  </table>
  <p class="mb-4 text-justify">График обязателен для работника и работодателя. О времени начала отпуска работник уведомляется не позднее чем за две недели (ст. 123 ТК РФ).</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1 uppercase text-black">Руководитель</div>
      <p class="mb-1"><strong>{{approve_fio}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1 uppercase text-black">Начальник отдела кадров</div>
      <p class="mb-1"><strong>{{hr_fio}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
  {
    id: "regulation-pay",
    name: "Положение об оплате труда",
    category: "business",
    actSource: "ст. 129, 135, 136 ТК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Локальный нормативный акт, устанавливающий систему оплаты труда, порядок, место и сроки выплаты заработной платы, аванс и индексацию.",
    suggestedDocs: ["regulation-bonus", "staffing-table", "internal-rules"],
    printInstruction:
      "Локальный нормативный акт, принимаемый с учётом мнения первичной профсоюзной организации (при её наличии). Работники знакомятся под роспись до подписания трудового договора (ст. 68 ТК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата утверждения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "approve_fio", label: "Руководитель (ФИО)", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "salary_system", label: "Система оплаты труда", type: "select", defaultValue: "повременно-премиальная", category: "payment",
        options: [
          { label: "Повременная", value: "повременная" },
          { label: "Повременно-премиальная", value: "повременно-премиальная" },
          { label: "Сдельная", value: "сдельная" },
          { label: "Смешанная", value: "смешанная" },
        ] },
      { id: "pay_days", label: "Сроки выплаты зарплаты", type: "text", defaultValue: "не реже чем каждые полмесяца: 25-го числа текущего месяца и 10-го числа следующего месяца", category: "payment", validation: { required: true } },
      { id: "advance_rule", label: "Порядок выплаты за первую половину месяца", type: "text", defaultValue: "за фактически отработанное время из расчёта оклада (тарифной ставки) работника", category: "payment" },
      { id: "indexation", label: "Индексация заработной платы", type: "text", defaultValue: "производится в связи с ростом потребительских цен на товары и услуги (ст. 134 ТК РФ)", category: "payment" },
      { id: "delay_note", label: "Ответственность за задержку выплат", type: "text", defaultValue: "за задержку выплаты начисляется денежная компенсация в размере не ниже 1/150 ключевой ставки Банка России за каждый день задержки (ст. 236 ТК РФ)", category: "payment" },
      { id: "other_terms", label: "Иные условия", type: "textarea", defaultValue: "", category: "contract", rows: 3 },
    ],
    previewTemplate:
      pageShell("Положение об оплате труда") +
      approveBlock() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">
    1.1. Настоящее Положение определяет систему оплаты труда, порядок и сроки выплаты заработной платы в {{company}} в соответствии с Трудовым кодексом РФ.
  </p>
  <p class="mb-4 text-justify">
    1.2. Система оплаты труда: {{salary_system}}. Заработная плата каждого работника зависит от его квалификации, сложности выполняемой работы, количества и качества затраченного труда (ст. 132 ТК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок и сроки выплаты заработной платы</div>
  <p class="mb-4 text-justify">2.1. Сроки выплаты заработной платы: {{pay_days}}.</p>
  <p class="mb-4 text-justify">2.2. Выплата за первую половину месяца: {{advance_rule}}.</p>
  <p class="mb-4 text-justify">2.3. Заработная плата выплачивается в денежной форме в рублях; по письменному заявлению работника допускается иная форма в соответствии со ст. 131 ТК РФ.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Индексация и гарантии</div>
  <p class="mb-4 text-justify">3.1. {{indexation}}.</p>
  <p class="mb-4 text-justify">3.2. {{delay_note}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Заключительные положения</div>
  <p class="mb-4 text-justify">
    4.1. Изменения и дополнения в настоящее Положение вносятся приказом руководителя с учётом мнения представительного органа работников (при наличии).
  </p>
  {{#other_terms}}<p class="mb-4 text-justify">4.2. {{other_terms}}.</p>{{/other_terms}}
  <p class="mb-4 text-justify">4.3. С настоящим Положением работники ознакомлены под роспись.</p>
</div>`,
  },
  {
    id: "regulation-bonus",
    name: "Положение о премировании работников",
    category: "business",
    actSource: "ст. 129, 135, 191 ТК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Локальный нормативный акт о видах, условиях, показателях и порядке выплаты премий работникам, а также об основаниях снижения или невыплаты премии.",
    suggestedDocs: ["regulation-pay", "reward-order", "internal-rules"],
    printInstruction:
      "Показатели и условия премирования должны быть понятны и достижимы, чтобы премия не превращалась в дискреционную выплату. Ознакомьте работников под роспись.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата утверждения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "approve_fio", label: "Руководитель (ФИО)", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "bonus_types", label: "Виды премий", type: "textarea", defaultValue: "текущая премия по итогам работы за месяц; премия по итогам работы за квартал (год); единовременная премия за выполнение особо важного задания", category: "payment", rows: 3, validation: { required: true } },
      { id: "period", label: "Периодичность выплаты", type: "select", defaultValue: "ежемесячно", category: "payment",
        options: [
          { label: "Ежемесячно", value: "ежемесячно" },
          { label: "Ежеквартально", value: "ежеквартально" },
          { label: "По итогам года", value: "по итогам года" },
          { label: "Единовременно по решению руководителя", value: "единовременно по решению руководителя" },
        ] },
      { id: "criteria", label: "Показатели премирования", type: "textarea", defaultValue: "выполнение плановых показателей; соблюдение сроков и качества работ; отсутствие брака и обоснованных жалоб", category: "payment", rows: 3 },
      { id: "max_percent", label: "Размер премии (% от оклада, максимум)", type: "number", defaultValue: "", category: "payment" },
      { id: "deprive", label: "Основания снижения или невыплаты премии", type: "textarea", defaultValue: "неисполнение или ненадлежащее исполнение должностных обязанностей; нарушение трудовой дисциплины; дисциплинарное взыскание; причинение ущерба организации", category: "payment", rows: 3 },
    ],
    previewTemplate:
      pageShell("Положение о премировании работников") +
      approveBlock() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">
    1.1. Настоящее Положение устанавливает виды, условия, показатели и порядок выплаты премий работникам {{company}} в соответствии со ст. 129, 135 ТК РФ.
  </p>
  <p class="mb-4 text-justify">1.2. Премия является поощрительной выплатой и не носит обязательного характера, за исключением случаев, прямо предусмотренных трудовым договором.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Виды и размер премий</div>
  <p class="mb-4 text-justify">2.1. Виды премий: {{bonus_types}}.</p>
  <p class="mb-4 text-justify">2.2. Периодичность выплаты: {{period}}.{{#max_percent}} Максимальный размер премии — {{max_percent}}% от должностного оклада работника.{{/max_percent}}</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Показатели и условия премирования</div>
  <p class="mb-4 text-justify">3.1. Показатели премирования: {{criteria}}.</p>
  <p class="mb-4 text-justify">3.2. Премия начисляется и выплачивается одновременно с заработной платой за соответствующий период.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Снижение и невыплата премии</div>
  <p class="mb-4 text-justify">4.1. Основания снижения или невыплаты премии: {{deprive}}.</p>
  <p class="mb-4 text-justify">4.2. Решение о выплате, снижении или невыплате премии оформляется приказом руководителя.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Заключительные положения</div>
  <p class="mb-4 text-justify">5.1. Изменения в настоящее Положение вносятся приказом руководителя. Работники ознакомлены с Положением под роспись.</p>
</div>`,
  },
  {
    id: "regulation-business-trip",
    name: "Положение о служебных командировках",
    category: "business",
    actSource: "гл. 24 ТК РФ (ст. 166–168); Постановление Правительства РФ от 13.10.2008 № 749",
    lastUpdated: "Сентябрь 2026",
    description:
      "Локальный нормативный акт о порядке направления работников в служебные командировки, размерах суточных, порядке возмещения расходов и отчётности.",
    suggestedDocs: ["business-trip-order"],
    printInstruction:
      "Положение регулирует командировки на территории РФ и за рубеж. Суточные в пределах норм не облагаются НДФЛ и страховыми взносами. Ознакомьте работников под роспись.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата утверждения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "approve_fio", label: "Руководитель (ФИО)", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "daily_ru", label: "Суточные по России (руб./сутки)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "daily_foreign", label: "Суточные за рубеж (руб./сутки)", type: "text", defaultValue: "", category: "payment" },
      { id: "report_days", label: "Срок представления отчёта после возвращения (рабочих дней)", type: "number", defaultValue: "3", category: "payment" },
      { id: "advance_note", label: "Порядок выдачи аванса", type: "text", defaultValue: "денежный аванс на оплату расходов выдаётся до отъезда в командировку", category: "payment" },
      { id: "expenses", label: "Возмещаемые расходы", type: "textarea", defaultValue: "расходы на проезд к месту командировки и обратно; расходы на наём жилого помещения; суточные; иные расходы, произведённые с согласия работодателя", category: "payment", rows: 3 },
    ],
    previewTemplate:
      pageShell("Положение о служебных командировках") +
      approveBlock() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">
    1.1. Настоящее Положение определяет порядок направления работников {{company}} в служебные командировки и возмещения расходов, связанных с командировкой (гл. 24 ТК РФ).
  </p>
  <p class="mb-4 text-justify">1.2. Служебная командировка — поездка работника по распоряжению работодателя на определённый срок для выполнения служебного поручения вне места постоянной работы.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок направления</div>
  <p class="mb-4 text-justify">2.1. Решение о направлении в командировку оформляется приказом руководителя. {{advance_note}}.</p>
  <p class="mb-4 text-justify">2.2. Средний заработок за период командировки сохраняется за работником по всем рабочим дням (ст. 167 ТК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Гарантии и компенсации</div>
  <p class="mb-4 text-justify">3.1. Суточные на территории РФ: <strong>{{daily_ru}} ({{daily_ru_words}})</strong> рублей за каждые сутки командировки.{{#daily_foreign}} Суточные при командировках за рубеж: {{daily_foreign}}.{{/daily_foreign}}</p>
  <p class="mb-4 text-justify">3.2. Возмещаемые расходы: {{expenses}}.</p>
  <p class="mb-4 text-justify">3.3. Отчёт о расходах представляется в течение {{report_days}} рабочих дней со дня возвращения из командировки с приложением подтверждающих документов.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Заключительные положения</div>
  <p class="mb-4 text-justify">4.1. Изменения в настоящее Положение вносятся приказом руководителя. Работники ознакомлены с Положением под роспись.</p>
</div>`,
  },
  {
    id: "labor-protection-instruction",
    name: "Инструкция по охране труда",
    category: "business",
    actSource: "ст. 212, 214, 225 ТК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Инструкция по охране труда для работника: общие требования охраны труда, требования перед началом, во время работы, в аварийных ситуациях и по окончании работы.",
    suggestedDocs: ["internal-rules", "medical-exam-referral"],
    printInstruction:
      "Инструкции по охране труда разрабатываются для каждой должности (профессии) и вида работ, утверждаются руководителем с учётом мнения профорганизации. Работник знакомится под роспись.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата утверждения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "approve_fio", label: "Руководитель (ФИО)", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "position", label: "Должность (профессия)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "general_req", label: "Общие требования охраны труда", type: "textarea", defaultValue: "к работе допускаются лица, прошедшие инструктаж, обучение и проверку знаний по охране труда, обязательный медицинский осмотр и не имеющие противопоказаний", category: "employee", rows: 3 },
      { id: "before_work", label: "Требования перед началом работы", type: "textarea", defaultValue: "надеть спецодежду, проверить исправность оборудования и инструмента, осмотреть рабочее место", category: "employee", rows: 3 },
      { id: "during_work", label: "Требования во время работы", type: "textarea", defaultValue: "использовать оборудование только по назначению, соблюдать правила безопасности, не допускать посторонних лиц на рабочее место", category: "employee", rows: 3 },
      { id: "emergency", label: "Требования в аварийных ситуациях", type: "textarea", defaultValue: "прекратить работу, сообщить руководителю, принять меры к эвакуации и оказанию первой помощи", category: "employee", rows: 3 },
      { id: "after_work", label: "Требования по окончании работы", type: "textarea", defaultValue: "отключить оборудование, привести в порядок рабочее место, снять спецодежду, сообщить руководителю о недостатках", category: "employee", rows: 3 },
    ],
    previewTemplate:
      pageShell("Инструкция по охране труда") +
      approveBlock() +
      `
  <p class="mb-4 text-justify">для должности (профессии): <strong>{{position}}</strong></p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие требования охраны труда</div>
  <p class="mb-4 text-justify">1.1. {{general_req}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Требования охраны труда перед началом работы</div>
  <p class="mb-4 text-justify">2.1. {{before_work}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Требования охраны труда во время работы</div>
  <p class="mb-4 text-justify">3.1. {{during_work}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Требования охраны труда в аварийных ситуациях</div>
  <p class="mb-4 text-justify">4.1. {{emergency}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Требования охраны труда по окончании работы</div>
  <p class="mb-4 text-justify">5.1. {{after_work}}.</p>
  <p class="mb-4 text-justify">5.2. С инструкцией ознакомлен(а): ____________________ /______________/ «___» ____________ 20___ г.</p>
</div>`,
  },
  {
    id: "commercial-secret-policy",
    name: "Положение о коммерческой тайне",
    category: "business",
    actSource: "Федеральный закон от 29.07.2004 № 98-ФЗ; ст. 1465, 1470 ГК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Локальный нормативный акт о режиме коммерческой тайны: перечень конфиденциальных сведений, порядок доступа, обязанности работников и ответственность.",
    suggestedDocs: ["nda-employee", "internal-rules"],
    printInstruction:
      "Режим коммерческой тайны считается установленным при выполнении всех мер из ст. 10 ФЗ № 98-ФЗ: определён перечень сведений, ограничен доступ, ведётся учёт лиц, получивших доступ, и урегулированы отношения с работниками. Ознакомьте под роспись.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата утверждения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "approve_fio", label: "Руководитель (ФИО)", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "secret_list", label: "Перечень сведений, составляющих коммерческую тайну", type: "textarea", defaultValue: "клиентская база и условия работы с контрагентами; коммерческие условия, цены, тарифы и скидки; данные о доходах и расходах; технология производства и ноу-хау; персональные данные работников; содержание внутренних документов", category: "contract", rows: 4, validation: { required: true } },
      { id: "access_order", label: "Порядок доступа", type: "textarea", defaultValue: "доступ предоставляется приказом руководителя с оформлением обязательства о неразглашении; ведётся учёт лиц, получивших доступ", category: "contract", rows: 3 },
      { id: "conf_term", label: "Срок сохранения режима тайны (лет)", type: "number", defaultValue: "3", category: "contract" },
      { id: "responsibility", label: "Ответственность за разглашение", type: "textarea", defaultValue: "дисциплинарная, материальная, административная и уголовная ответственность в соответствии с законодательством РФ (ст. 14 ФЗ № 98-ФЗ, ст. 183 УК РФ)", category: "contract", rows: 2 },
    ],
    previewTemplate:
      pageShell("Положение о коммерческой тайне") +
      approveBlock() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">
    1.1. Настоящее Положение устанавливает режим коммерческой тайны в {{company}} в соответствии с Федеральным законом от 29.07.2004 № 98-ФЗ «О коммерческой тайне».
  </p>
  <p class="mb-4 text-justify">1.2. Режим коммерческой тайны вводится для охраны конфиденциальности информации, имеющей действительную или потенциальную коммерческую ценность в силу неизвестности её третьим лицам (ст. 1465 ГК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сведения, составляющие коммерческую тайну</div>
  <p class="mb-4 text-justify">2.1. К коммерческой тайне относятся: {{secret_list}}.</p>
  <p class="mb-4 text-justify">2.2. Не являются коммерческой тайной сведения, перечисленные в ст. 5 ФЗ № 98-ФЗ (в том числе учредительные документы, сведения об экологии и об условиях труда).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Порядок доступа и обязанности работников</div>
  <p class="mb-4 text-justify">3.1. {{access_order}}.</p>
  <p class="mb-4 text-justify">3.2. Работники обязаны не разглашать сведения, составляющие коммерческую тайну, в течение трудовых отношений и {{conf_term}} лет после их прекращения.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность</div>
  <p class="mb-4 text-justify">4.1. {{responsibility}}.</p>
  <p class="mb-4 text-justify">4.2. С Положением работники ознакомлены под роспись.</p>
</div>`,
  },
  {
    id: "regulation-attestation",
    name: "Положение об аттестации работников",
    category: "business",
    actSource: "ст. 81 ч.1 п.3 ТК РФ; ФЗ от 03.07.2016 № 238-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Локальный нормативный акт о порядке проведения аттестации работников: цели, периодичность, состав комиссии, процедура и решения по результатам.",
    suggestedDocs: ["job-description", "internal-rules"],
    printInstruction:
      "Порядок аттестации без специального положения может нарушать права работников: состав комиссии, критерии и последствия аттестации должны быть закреплены локально. Ознакомьте под роспись.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата утверждения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "approve_fio", label: "Руководитель (ФИО)", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "purposes", label: "Цели аттестации", type: "textarea", defaultValue: "определение соответствия работника занимаемой должности; выявление уровня профессиональной подготовки; планирование повышения квалификации", category: "employee", rows: 3 },
      { id: "frequency", label: "Периодичность", type: "text", defaultValue: "не чаще одного раза в год и не реже одного раза в три года", category: "contract", validation: { required: true } },
      { id: "commission", label: "Состав комиссии", type: "textarea", defaultValue: "председатель комиссии — руководитель организации; члены комиссии — заместитель руководителя, руководитель подразделения, специалист по кадрам, представитель профсоюза (при наличии)", category: "employee", rows: 3 },
      { id: "procedure", label: "Порядок проведения", type: "textarea", defaultValue: "аттестация проводится в форме собеседования и оценки профессиональных знаний; работник уведомляется не позднее чем за месяц; результаты заносятся в протокол", category: "contract", rows: 3 },
      { id: "results", label: "Решения по результатам", type: "textarea", defaultValue: "соответствует занимаемой должности; соответствует занимаемой должности с рекомендацией повышения квалификации; не соответствует занимаемой должности", category: "contract", rows: 2 },
    ],
    previewTemplate:
      pageShell("Положение об аттестации работников") +
      approveBlock() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">
    1.1. Настоящее Положение определяет порядок проведения аттестации работников {{company}} в целях оценки соответствия работника занимаемой должности.
  </p>
  <p class="mb-4 text-justify">1.2. Цели аттестации: {{purposes}}.</p>
  <p class="mb-4 text-justify">1.3. Аттестация проводится {{frequency}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Аттестационная комиссия</div>
  <p class="mb-4 text-justify">2.1. Состав комиссии: {{commission}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Порядок проведения аттестации</div>
  <p class="mb-4 text-justify">3.1. {{procedure}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Решения по результатам аттестации</div>
  <p class="mb-4 text-justify">4.1. Комиссия принимает одно из решений: {{results}}.</p>
  <p class="mb-4 text-justify">4.2. При аттестации, подтвердившей недостаточную квалификацию работника, работодатель вправе расторгнуть трудовой договор по п. 3 ч. 1 ст. 81 ТК РФ с соблюдением требований ст. 81 и 82 ТК РФ.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Заключительные положения</div>
  <p class="mb-4 text-justify">5.1. Работники ознакомлены с настоящим Положением под роспись.</p>
</div>`,
  },
  {
    id: "absence-act",
    name: "Акт об отсутствии работника на рабочем месте",
    category: "business",
    actSource: "ст. 81 ч.1 п.6 подп. «а» ТК РФ; ст. 193 ТК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Акт, фиксирующий отсутствие работника на рабочем месте, с указанием времени и свидетелей; служит основанием для применения дисциплинарного взыскания.",
    suggestedDocs: ["disciplinary-order", "refusal-explanation-act"],
    printInstruction:
      "Акт составляется в день отсутствия (желательно в присутствии двух и более свидетелей), подписывается комиссией. Если работник отказывается ознакомиться, составьте акт об отказе.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "act_number", label: "Номер акта", type: "text", defaultValue: "", category: "contract" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee" },
      { id: "absence_date", label: "Дата отсутствия", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "time_from", label: "Время с", type: "text", defaultValue: "", category: "contract" },
      { id: "time_to", label: "Время по", type: "text", defaultValue: "", category: "contract" },
      { id: "absence_type", label: "Характер отсутствия", type: "select", defaultValue: "отсутствие на рабочем месте без уважительных причин в течение всего рабочего дня", category: "contract",
        options: [
          { label: "Отсутствие весь рабочий день", value: "отсутствие на рабочем месте без уважительных причин в течение всего рабочего дня" },
          { label: "Отсутствие более 4 часов подряд", value: "отсутствие на рабочем месте без уважительных причин более четырёх часов подряд" },
          { label: "Отсутствие без уважительных причин (иное)", value: "отсутствие на рабочем месте без уважительных причин" },
        ] },
      { id: "witness1", label: "Член комиссии / свидетель 1 (ФИО, должность)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "witness2", label: "Член комиссии / свидетель 2 (ФИО, должность)", type: "text", defaultValue: "", category: "employee" },
    ],
    previewTemplate:
      pageShell("Акт об отсутствии работника на рабочем месте") +
      `
  <p class="mb-4 text-justify">Акт № {{act_number}} от «{{date}}».</p>
  <p class="mb-4 text-justify">
    Настоящим актом удостоверяется, что работник <strong>{{employee_fio}}</strong>, занимающий должность {{position}}, отсутствовал на рабочем месте
    {{absence_date}} с {{time_from}} до {{time_to}} — {{absence_type}}.
  </p>
  <p class="mb-4 text-justify">Объяснения работника: __________________________________________________________________.</p>
  <p class="mb-4 text-justify">
    Указанное обстоятельство подтверждается докладной запиской непосредственного руководителя и показаниями свидетелей. Акт составлен для решения вопроса о применении дисциплинарного взыскания.
  </p>` +
      actFooter +
      `</div>`,
  },
  {
    id: "intoxication-act",
    name: "Акт о состоянии опьянения работника",
    category: "business",
    actSource: "ст. 76, 81 ч.1 п.6 подп. «б» ТК РФ; Приказ Минздрава РФ от 18.12.2015 № 933н",
    lastUpdated: "Сентябрь 2026",
    description:
      "Акт, фиксирующий признаки алкогольного (наркотического) опьянения работника, отстранение от работы и сведения о медицинском освидетельствовании.",
    suggestedDocs: ["disciplinary-order", "absence-act"],
    printInstruction:
      "Признаки опьянения должны быть описаны конкретно. Наиболее доказательным является медицинское освидетельствование; при отказе работника от него составьте акт с указанием этого факта.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "act_number", label: "Номер акта", type: "text", defaultValue: "", category: "contract" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee" },
      { id: "place", label: "Место составления", type: "text", defaultValue: "", category: "contract" },
      { id: "time", label: "Время", type: "text", defaultValue: "", category: "contract" },
      { id: "signs", label: "Признаки опьянения", type: "textarea", defaultValue: "запах алкоголя изо рта; неустойчивость позы и шаткость походки; нарушение речи; резкое изменение окраски кожных покровов лица; поведение, не соответствующее обстановке", category: "contract", rows: 3, validation: { required: true } },
      { id: "medical_note", label: "Медицинское освидетельствование", type: "select", defaultValue: "работник направлен на медицинское освидетельствование, от прохождения которого отказался", category: "contract",
        options: [
          { label: "Проведено, установлено состояние опьянения", value: "проведено медицинское освидетельствование, по результатам которого установлено состояние опьянения" },
          { label: "Работник отказался от освидетельствования", value: "работник направлен на медицинское освидетельствование, от прохождения которого отказался" },
          { label: "Не проводилось", value: "медицинское освидетельствование не проводилось" },
        ] },
      { id: "witness1", label: "Член комиссии / свидетель 1 (ФИО, должность)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "witness2", label: "Член комиссии / свидетель 2 (ФИО, должность)", type: "text", defaultValue: "", category: "employee" },
    ],
    previewTemplate:
      pageShell("Акт о состоянии опьянения работника") +
      `
  <p class="mb-4 text-justify">Акт № {{act_number}} от «{{date}}», составлен в {{place}} в {{time}}.</p>
  <p class="mb-4 text-justify">
    Настоящим актом удостоверяется, что работник <strong>{{employee_fio}}</strong>, занимающий должность {{position}}, находится в состоянии, имеющем признаки опьянения:
    {{signs}}.
  </p>
  <p class="mb-4 text-justify">Медицинское освидетельствование: {{medical_note}}.</p>
  <p class="mb-4 text-justify">
    В соответствии со ст. 76 ТК РФ работник отстранён от работы до устранения обстоятельств, явившихся основанием для отстранения. За период отстранения заработная плата не начисляется.
  </p>` +
      actFooter +
      `</div>`,
  },
  {
    id: "refusal-explanation-act",
    name: "Акт об отказе работника от дачи объяснений",
    category: "business",
    actSource: "ст. 193 ТК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Акт, фиксирующий отказ работника представить письменные объяснения по факту дисциплинарного проступка либо неполучение объяснений.",
    suggestedDocs: ["disciplinary-order", "absence-act"],
    printInstruction:
      "До применения взыскания работодатель обязан запросить письменное объяснение. Если по истечении двух рабочих дней объяснение не представлено, составляется настоящий акт (ст. 193 ТК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "act_number", label: "Номер акта", type: "text", defaultValue: "", category: "contract" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee" },
      { id: "request_date", label: "Дата предъявления требования об объяснениях", type: "date", defaultValue: "", category: "contract" },
      { id: "request_subject", label: "По какому факту запрошены объяснения", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "refusal_note", label: "Обстоятельства", type: "text", defaultValue: "по истечении двух рабочих дней письменное объяснение работником не представлено", category: "contract" },
      { id: "witness1", label: "Член комиссии / свидетель 1 (ФИО, должность)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "witness2", label: "Член комиссии / свидетель 2 (ФИО, должность)", type: "text", defaultValue: "", category: "employee" },
    ],
    previewTemplate:
      pageShell("Акт об отказе работника от дачи объяснений") +
      `
  <p class="mb-4 text-justify">Акт № {{act_number}} от «{{date}}».</p>
  <p class="mb-4 text-justify">
    Работнику <strong>{{employee_fio}}</strong>, занимающему должность {{position}}, «{{request_date}}» предъявлено требование о представлении письменных объяснений по факту: {{request_subject}}.
  </p>
  <p class="mb-4 text-justify">Настоящим актом удостоверяется, что {{refusal_note}} (ст. 193 ТК РФ).</p>
  <p class="mb-4 text-justify">Отказ работника от дачи объяснений не является препятствием для применения дисциплинарного взыскания.</p>` +
      actFooter +
      `</div>`,
  },
  {
    id: "layoff-notice",
    name: "Уведомление о сокращении численности (штата)",
    category: "business",
    actSource: "ст. 81 ч.1 п.2, ст. 180, 373 ТК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Персональное уведомление работника о предстоящем увольнении в связи с сокращением численности или штата, с предложением вакансий.",
    suggestedDocs: ["termination-employment", "firing-order"],
    printInstruction:
      "Работник предупреждается персонально и под роспись не менее чем за два месяца до увольнения. Одновременно предлагаются все имеющиеся вакансии. При массовом увольнении — уведомление профсоюза и службы занятости.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата уведомления", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee" },
      { id: "department", label: "Подразделение", type: "text", defaultValue: "", category: "employee" },
      { id: "reduction_basis", label: "Основание сокращения", type: "text", defaultValue: "сокращение численности (штата) работников организации", category: "contract", validation: { required: true } },
      { id: "dismissal_date", label: "Предполагаемая дата увольнения", type: "date", defaultValue: "", category: "contract" },
      { id: "vacancies", label: "Предложенные вакансии", type: "textarea", defaultValue: "вакантные должности, соответствующие квалификации работника, а также нижестоящие должности, которые работник может занимать с учётом состояния здоровья", category: "contract", rows: 3 },
      { id: "hr_fio", label: "Уполномоченное лицо (ФИО, должность)", type: "text", defaultValue: "", category: "employee" },
    ],
    previewTemplate:
      pageShell("Уведомление о сокращении численности (штата)") +
      `
  <p class="mb-4 text-justify"><strong>{{employee_fio}}</strong>, должность {{position}}, подразделение {{department}}.</p>
  <p class="mb-4 text-justify">
    Уважаемый(ая) {{employee_fio}}! {{company}} уведомляет Вас о предстоящем увольнении по основанию, предусмотренному п. 2 ч. 1 ст. 81 ТК РФ
    ({{reduction_basis}}), с «{{dismissal_date}}».
  </p>
  <p class="mb-4 text-justify">
    В соответствии с ч. 3 ст. 81 ТК РФ Вам предлагаются имеющиеся вакансии: {{vacancies}}. Вы вправе сообщить о согласии на перевод на любую из предложенных должностей.
  </p>
  <p class="mb-4 text-justify">
    При увольнении Вам будут предоставлены гарантии и компенсации, предусмотренные ст. 178, 180 ТК РФ (выходное пособие и сохранение среднего заработка на период трудоустройства).
  </p>
  <p class="mb-8 text-justify">С уведомлением ознакомлен(а): ____________________ /{{employee_fio}}/ «___» ____________ 20___ г.</p>
  <p class="mb-4 text-justify">Уполномоченное лицо: ____________________ /{{hr_fio}}/</p>
</div>`,
  },
  {
    id: "vacation-notice",
    name: "Уведомление работника о начале отпуска",
    category: "business",
    actSource: "ст. 123 ТК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Уведомление работника о времени начала ежегодного оплачиваемого отпуска не позднее чем за две недели до его начала.",
    suggestedDocs: ["vacation-schedule", "vacation-order"],
    printInstruction:
      "Обязательная мера по ст. 123 ТК РФ. Отсутствие уведомления за две недели — нарушение трудового законодательства. Вручается под роспись или направляется способом, подтверждающим получение.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата уведомления", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee" },
      { id: "vacation_start", label: "Начало отпуска", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "vacation_end", label: "Окончание отпуска", type: "date", defaultValue: "", category: "contract" },
      { id: "vacation_days", label: "Количество календарных дней", type: "number", defaultValue: "", category: "contract" },
      { id: "approve_fio", label: "Уполномоченное лицо (ФИО)", type: "text", defaultValue: "", category: "employer" },
    ],
    previewTemplate:
      pageShell("Уведомление о начале отпуска") +
      `
  <p class="mb-4 text-justify"><strong>{{employee_fio}}</strong>, должность {{position}}.</p>
  <p class="mb-4 text-justify">
    Уважаемый(ая) {{employee_fio}}! {{company}} уведомляет Вас о предоставлении ежегодного оплачиваемого отпуска
    с «{{vacation_start}}» по «{{vacation_end}}» продолжительностью {{vacation_days}} календарных дней в соответствии с графиком отпусков.
  </p>
  <p class="mb-4 text-justify">
    Уведомление направлено не позднее чем за две недели до начала отпуска (ст. 123 ТК РФ). При необходимости Вы вправе обратиться с заявлением о переносе отпуска в порядке, установленном ТК РФ.
  </p>
  <p class="mb-8 text-justify">С уведомлением ознакомлен(а): ____________________ /{{employee_fio}}/ «___» ____________ 20___ г.</p>
  <p class="mb-4 text-justify">Уполномоченное лицо: ____________________ /{{approve_fio}}/</p>
</div>`,
  },
  {
    id: "medical-exam-referral",
    name: "Направление на обязательный медицинский осмотр",
    category: "business",
    actSource: "ст. 214, 220 ТК РФ; Приказ Минздрава РФ от 28.01.2021 № 29н",
    lastUpdated: "Сентябрь 2026",
    description:
      "Направление работника на обязательный предварительный, периодический или внеочередной медицинский осмотр с указанием вредных факторов и медицинской организации.",
    suggestedDocs: ["labor-protection-instruction", "internal-rules"],
    printInstruction:
      "Обязательные медосмотры отдельных категорий работников (ст. 220 ТК РФ) финансируются работодателем с сохранением среднего заработка на время осмотра. Учтите вид осмотра и вредные производственные факторы.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "position", label: "Должность (профессия)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "department", label: "Подразделение", type: "text", defaultValue: "", category: "employee" },
      { id: "exam_type", label: "Вид осмотра", type: "select", defaultValue: "периодический", category: "contract",
        options: [
          { label: "Предварительный (при приёме на работу)", value: "предварительный (при приёме на работу)" },
          { label: "Периодический", value: "периодический" },
          { label: "Внеочередной", value: "внеочередной" },
        ] },
      { id: "medical_org", label: "Медицинская организация", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "exam_date", label: "Дата осмотра", type: "date", defaultValue: "", category: "contract" },
      { id: "factors", label: "Вредные (опасные) производственные факторы и работы", type: "textarea", defaultValue: "", category: "contract", rows: 2 },
      { id: "responsible_fio", label: "Ответственное лицо (ФИО, должность)", type: "text", defaultValue: "", category: "employee" },
    ],
    previewTemplate:
      pageShell("Направление на обязательный медицинский осмотр") +
      `
  <p class="mb-4 text-justify">
    {{company}} направляет работника <strong>{{employee_fio}}</strong>, должность (профессия) {{position}}, подразделение {{department}},
    на {{exam_type}} медицинский осмотр в {{medical_org}}.
  </p>
  <p class="mb-4 text-justify">Дата (период) осмотра: «{{exam_date}}».</p>
  {{#factors}}<p class="mb-4 text-justify">Вредные (опасные) производственные факторы и виды работ: {{factors}}.</p>{{/factors}}
  <p class="mb-4 text-justify">
    На время прохождения медицинского осмотра за работником сохраняется место работы и средний заработок (ст. 185 ТК РФ). Прохождение осмотра является обязательным условием допуска к работе (ст. 214, 220 ТК РФ).
  </p>
  <p class="mb-8 text-justify">Направление получил(а): ____________________ /{{employee_fio}}/ «___» ____________ 20___ г.</p>
  <p class="mb-4 text-justify">Ответственное лицо: ____________________ /{{responsible_fio}}/</p>
</div>`,
  },
  {
    id: "disciplinary-order",
    name: "Приказ о дисциплинарном взыскании",
    category: "business",
    actSource: "ст. 192, 193 ТК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Приказ о применении дисциплинарного взыскания (замечание, выговор, увольнение) с указанием проступка и документов-оснований.",
    suggestedDocs: ["absence-act", "refusal-explanation-act"],
    printInstruction:
      "До издания приказа затребуйте письменное объяснение и соблюдайте сроки: взыскание применяется не позднее одного месяца со дня обнаружения и не позднее шести месяцев со дня совершения проступка (ст. 193 ТК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата приказа", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "order_number", label: "Номер приказа", type: "text", defaultValue: "", category: "contract" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee" },
      { id: "department", label: "Подразделение", type: "text", defaultValue: "", category: "employee" },
      { id: "misconduct", label: "Существо дисциплинарного проступка", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "explanation_note", label: "Объяснение работника", type: "select", defaultValue: "письменное объяснение работником не представлено, о чём составлен акт", category: "contract",
        options: [
          { label: "Объяснение представлено", value: "работником представлено письменное объяснение" },
          { label: "Объяснение не представлено", value: "письменное объяснение работником не представлено, о чём составлен акт" },
        ] },
      { id: "discipline_type", label: "Вид взыскания", type: "select", defaultValue: "выговор", category: "contract", validation: { required: true },
        options: [
          { label: "Замечание", value: "замечание" },
          { label: "Выговор", value: "выговор" },
          { label: "Увольнение", value: "увольнение" },
        ] },
      { id: "basis_docs", label: "Документы-основания", type: "textarea", defaultValue: "акт об отсутствии на рабочем месте; докладная записка непосредственного руководителя", category: "contract", rows: 2 },
    ],
    previewTemplate:
      pageShell("Приказ о дисциплинарном взыскании") +
      `
  <p class="mb-4 text-justify">Приказ № {{order_number}} от «{{date}}».</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Основание</div>
  <p class="mb-4 text-justify">
    За ненадлежащее исполнение работником <strong>{{employee_fio}}</strong>, должность {{position}}, подразделение {{department}}, возложенных на него трудовых обязанностей,
    выразившееся в следующем: {{misconduct}}.
  </p>
  <p class="mb-4 text-justify">Объяснение: {{explanation_note}}. Документы-основания: {{basis_docs}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Приказываю</div>
  <p class="mb-4 text-justify">
    Применить к работнику дисциплинарное взыскание в виде <strong>{{discipline_type}}</strong> в соответствии со ст. 192 ТК РФ.
  </p>
  <p class="mb-4 text-justify">Взыскание действует в течение одного года со дня применения и может быть снято досрочно по инициативе работника, руководителя или профсоюза (ст. 194 ТК РФ).</p>` +
      orderFooter() +
      `</div>`,
  },
  {
    id: "reward-order",
    name: "Приказ о поощрении работника (Т-11)",
    category: "business",
    actSource: "ст. 191 ТК РФ; Постановление Госкомстата РФ от 05.01.2004 № 1 (форма Т-11)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Приказ о поощрении работника (форма Т-11): благодарность, премия, ценный подарок, почётная грамота за добросовестный труд.",
    suggestedDocs: ["regulation-bonus", "hire-order"],
    printInstruction:
      "Работодатель поощряет работников за добросовестное исполнение трудовых обязанностей (ст. 191 ТК РФ). При премировании укажите источник выплаты; призы и подарки дороже 4000 руб. облагаются НДФЛ.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата приказа", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "order_number", label: "Номер приказа", type: "text", defaultValue: "", category: "contract" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee" },
      { id: "department", label: "Подразделение", type: "text", defaultValue: "", category: "employee" },
      { id: "reward_reason", label: "За что поощряется", type: "textarea", defaultValue: "за добросовестное исполнение трудовых обязанностей, высокие результаты в труде", category: "contract", rows: 2, validation: { required: true } },
      { id: "reward_type", label: "Вид поощрения", type: "select", defaultValue: "объявление благодарности", category: "contract", validation: { required: true },
        options: [
          { label: "Объявление благодарности", value: "объявление благодарности" },
          { label: "Премия", value: "выплата премии" },
          { label: "Ценный подарок", value: "вручение ценного подарка" },
          { label: "Почётная грамота", value: "награждение почётной грамотой" },
          { label: "Занесение на Доску почёта", value: "занесение на Доску почёта" },
        ] },
      { id: "reward_sum", label: "Сумма премии / стоимость подарка (руб., если применимо)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate:
      pageShell("Приказ о поощрении работника") +
      `
  <p class="mb-4 text-justify">Приказ № {{order_number}} от «{{date}}».</p>
  <p class="mb-4 text-justify">
    За {{reward_reason}} объявить работнику <strong>{{employee_fio}}</strong>, должность {{position}}, подразделение {{department}}, поощрение в виде: {{reward_type}}.
  </p>
  {{#reward_sum}}<p class="mb-4 text-justify">Выплатить (вручить) в связи с поощрением: <strong>{{reward_sum}} ({{reward_sum_words}})</strong> рублей.</p>{{/reward_sum}}
  <p class="mb-4 text-justify">Основание: представление непосредственного руководителя, ст. 191 ТК РФ.</p>` +
      orderFooter() +
      `</div>`,
  },
];