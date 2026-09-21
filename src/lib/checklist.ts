import type { LegalTemplate } from "@/data/types";

export type ChecklistKind =
  | "doc" // документ на руках / проверить наличие
  | "gov" // государственная проверка (внешняя ссылка)
  | "companion" // сопутствующий документ, который сайт может сформировать
  | "contract" // условие самого договора
  | "party"; // проверка стороны сделки

export interface ChecklistCtx {
  template: LegalTemplate;
  formValues: Record<string, string>;
  /** Документы, доступные у шаблона (template.suggestedDocs). */
  suggestedDocs: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  group: string;
  kind: ChecklistKind;
  /** Короткое пояснение, зачем это важно (показывается при наведении). */
  why?: string;
  /** Внешняя ссылка для гос. проверки. */
  govUrl?: string;
  govLabel?: string;
  /** id сопутствующего шаблона, который закрывает этот пункт. */
  docId?: string;
  docLabel?: string;
  /** Показывать только для этой роли; undefined — для всех. */
  perspective?: "buyer" | "seller";
  /** Категории шаблонов, к которым относится пункт (пусто — для всех). */
  cats?: string[];
  /** Дополнительное условие показа пункта. */
  include?: (ctx: ChecklistCtx) => boolean;
  /** Автоматическое выполнение пункта по данным формы. */
  auto?: (ctx: ChecklistCtx) => boolean;
}

const hasField = (ctx: ChecklistCtx, id: string) =>
  ctx.template.fields.some((f) => f.id === id);

const hasAnyField = (ctx: ChecklistCtx, ids: string[]) =>
  ids.some((id) => hasField(ctx, id));

const hasCategory = (ctx: ChecklistCtx, cat: string) =>
  ctx.template.fields.some((f) => f.category === cat);

const hasVehicle = (ctx: ChecklistCtx) =>
  ctx.template.fields.some(
    (f) =>
      f.id === "car_vin" ||
      f.id.startsWith("car_") ||
      f.id.startsWith("vehicle_") ||
      f.id.startsWith("trailer_") ||
      f.id === "boat_vin"
  );

const hasOsago = (ctx: ChecklistCtx) =>
  ctx.template.fields.some((f) => f.id.startsWith("osago_"));

const hasRepresentative = (ctx: ChecklistCtx) =>
  ctx.template.fields.some(
    (f) =>
      f.category === "representative" ||
      f.category === "agent" ||
      f.id.startsWith("representative_") ||
      f.id.startsWith("agent_")
  );

const isMarried = (ctx: ChecklistCtx) => {
  const v = (
    ctx.formValues["seller_married"] ||
    ctx.formValues["owner_married"] ||
    ""
  )
    .toString()
    .toLowerCase();
  return v === "yes" || v === "да" || v === "true" || v === "1";
};

const hasWords = (ctx: ChecklistCtx, base: string) =>
  Boolean(ctx.formValues[base] && ctx.formValues[`${base}_words`]);

export const CHECKLIST_RULES: ChecklistItem[] = [
  // ---------- Общие (все сделки) ----------
  {
    id: "sign-both",
    label: "Договор подписан обеими сторонами",
    group: "Оформление и подписание",
    kind: "doc",
    why: "Без подписи сторон договор не вступает в силу (ст. 160 ГК РФ).",
  },
  {
    id: "copies-enough",
    label: "Число экземпляров достаточно (стороны + госорган)",
    group: "Оформление и подписание",
    kind: "doc",
    why: "Для регистрируемых сделок нужен лишний экземпляр (Росреестр/ГИБДД).",
    include: (ctx) =>
      hasCategory(ctx, "realty") || hasVehicle(ctx) || hasAnyField(ctx, ["cadastre_number", "car_vin"]),
  },

  // ---------- Условия договора (деньги) ----------
  {
    id: "price-words",
    label: "Сумма указана цифрами и прописью",
    group: "Условия договора",
    kind: "contract",
    why: "Цена — существенное условие ДКП; расхождение делает договор неоднозначным.",
    auto: (ctx) => hasWords(ctx, "contract_price") || hasWords(ctx, "amount") || hasWords(ctx, "loan_amount"),
    include: (ctx) => hasAnyField(ctx, ["contract_price", "amount", "loan_amount"]),
  },
  {
    id: "price-match",
    label: "Сумма цифрами и прописью совпадают",
    group: "Условия договора",
    kind: "contract",
    why: "Ошибка в прописи цены — частая причина споров и отказа в регистрации.",
    include: (ctx) => hasAnyField(ctx, ["contract_price", "amount", "loan_amount"]),
  },
  {
    id: "term-set",
    label: "Срок исполнения / возврата указан",
    group: "Условия договора",
    kind: "contract",
    why: "Без срока обязательство считается несогласованным (ст. 314 ГК РФ).",
    perspective: "buyer",
    include: (ctx) =>
      hasAnyField(ctx, ["loan_term", "repayment_date", "deadline", "date_end", "delivery_date"]),
  },
  {
    id: "rate-set",
    label: "Ставка / проценты указаны явно",
    group: "Условия договора",
    kind: "contract",
    why: "Для займа проценты — существенное условие; иначе по ст. 809 ГК РФ 0%.",
    perspective: "buyer",
    include: (ctx) => hasAnyField(ctx, ["rate", "percent", "interest"]),
  },

  // ---------- АВТО ----------
  {
    id: "auto-pts-sts",
    label: "ПТС и СТС на руках, данные совпадают с договором",
    group: "Документы на автомобиль",
    kind: "doc",
    why: "Сверьте VIN, марку, собственника в ПТС/СТС с продавцом и договором.",
    cats: ["auto"],
    include: hasVehicle,
  },
  {
    id: "auto-vin",
    label: "VIN совпадает в ПТС, СТС и на табличке кузова",
    group: "Документы на автомобиль",
    kind: "doc",
    why: "Расхождение VIN — признак перебитых номеров (уголовное деяние).",
    cats: ["auto"],
    include: hasVehicle,
  },
  {
    id: "auto-odometer",
    label: "Пробег и состояние осмотрены, скрытых дефектов нет",
    group: "Документы на автомобиль",
    kind: "doc",
    why: "Осмотр до передачи денег снижает риск спора о недостатках.",
    cats: ["auto"],
    perspective: "buyer",
    include: hasVehicle,
  },
  {
    id: "auto-gibdd-limit",
    label: "Нет ограничений на регистрацию",
    group: "Государственные проверки",
    kind: "gov",
    govUrl: "https://гибдд.рф/check/auto",
    govLabel: "Проверить на ГИБДД",
    why: "Ограничение = нельзя перерегистрировать; сделку могут сорвать.",
    cats: ["auto"],
    perspective: "buyer",
    include: hasVehicle,
  },
  {
    id: "auto-gibdd-history",
    label: "Нет залога, ареста, крупных ДТП (проверено)",
    group: "Государственные проверки",
    kind: "gov",
    govUrl: "https://гибдд.рф/check/auto",
    govLabel: "ГИБДД",
    why: "Залог/арест блокируют сделку; ДТП влияет на цену и безопасность.",
    cats: ["auto"],
    perspective: "buyer",
    include: hasVehicle,
  },
  {
    id: "auto-osago",
    label: "Полис ОСАГО оформлен на нового владельца",
    group: "Документы на автомобиль",
    kind: "doc",
    why: "Без ОСАГО эксплуатация после покупки незаконна (10-дневная льгота отменена с 01.03.2025).",
    cats: ["auto"],
    include: hasOsago,
  },
  {
    id: "auto-passport-seller",
    label: "Паспорт продавца действителен, данные совпадают",
    group: "Проверка сторон",
    kind: "party",
    why: "Недействительный паспорт делает сделку недействительной.",
    cats: ["auto"],
  },
  {
    id: "auto-representative",
    label: "Доверенность продавца проверена в реестре",
    group: "Государственные проверки",
    kind: "gov",
    govUrl: "https://reestr-dover.ru/",
    govLabel: "reestr-dover.ru",
    why: "Продажа по поддельной доверенности не переоформляет право.",
    cats: ["auto"],
    perspective: "buyer",
    include: hasRepresentative,
  },
  {
    id: "auto-raspiska",
    label: "Расписка о получении денег",
    group: "Сопутствующие документы",
    kind: "companion",
    docId: "raspiska-money",
    docLabel: "Сформировать расписку",
    why: "Подтверждает передачу оплаты; критично при наличных расчётах.",
    cats: ["auto"],
    perspective: "seller",
  },
  {
    id: "auto-act",
    label: "Акт приёма-передачи ТС подписан",
    group: "Сопутствующие документы",
    kind: "companion",
    docId: "act-transfer-auto",
    docLabel: "Сформировать акт",
    why: "Фиксирует переход ТС и снимает вопросы по комплектности.",
    cats: ["auto"],
  },
  {
    id: "auto-spouse",
    label: "Согласие супруга оформлено нотариально",
    group: "Проверка сторон",
    kind: "companion",
    docId: "spouse-consent-car-sale",
    docLabel: "Сформировать согласие",
    why: "При продаже авто в браке нужно нотариальное согласие супруга (совместная собственность).",
    cats: ["auto"],
    perspective: "buyer",
    include: isMarried,
  },

  // ---------- НЕДВИЖИМОСТЬ ----------
  {
    id: "realty-egrn",
    label: "Свежая выписка ЕГРН получена (не старше 30 дней)",
    group: "Документы на объект",
    kind: "doc",
    why: "ЕГРН — главное доказательство права; старше 30 дней может не отражать обременения.",
    cats: ["realty"],
    perspective: "buyer",
  },
  {
    id: "realty-title",
    label: "Правоустанавливающие документы проверены",
    group: "Документы на объект",
    kind: "doc",
    why: "Договор, наследство, приватизация — основание возникновения права.",
    cats: ["realty"],
    perspective: "buyer",
  },
  {
    id: "realty-encumbrance",
    label: "Нет обременений, арестов, запретов (по ЕГРН)",
    group: "Государственные проверки",
    kind: "gov",
    govUrl: "https://rosreestr.gov.ru/",
    govLabel: "Росреестр",
    why: "Арест/ипотека блокируют регистрацию перехода права.",
    cats: ["realty"],
    perspective: "buyer",
  },
  {
    id: "realty-jku",
    label: "Нет долгов по ЖКУ и капремонту",
    group: "Документы на объект",
    kind: "doc",
    why: "Долги прежнего владельца не переходят, но портят отношения; возьмите справку.",
    cats: ["realty"],
    perspective: "buyer",
  },
  {
    id: "realty-registered",
    label: "В объекте никто не зарегистрирован (справка)",
    group: "Документы на объект",
    kind: "doc",
    why: "Зарегистрированные лица сохраняют право проживания.",
    cats: ["realty"],
    perspective: "buyer",
  },
  {
    id: "realty-bankrupt",
    label: "Продавец не признан банкротом",
    group: "Государственные проверки",
    kind: "gov",
    govUrl: "https://fedresurs.ru/",
    govLabel: "ЕФРСБ",
    why: "Банкротство грозит оспариванием сделки в будущем.",
    cats: ["realty"],
    perspective: "buyer",
  },
  {
    id: "realty-matcap",
    label: "Материнский капитал не нарушен (или риск учтён)",
    group: "Документы на объект",
    kind: "doc",
    why: "Нарушение прав детей → сделку могут отменить спустя годы.",
    cats: ["realty"],
    perspective: "buyer",
  },
  {
    id: "realty-spouse",
    label: "Согласие супруга оформлено нотариально",
    group: "Проверка сторон",
    kind: "companion",
    docId: "spouse-consent-sell",
    docLabel: "Сформировать согласие",
    why: "Без нотариального согласия супруга сделка с совместным имуществом оспорима, даже после развода.",
    cats: ["realty"],
    perspective: "buyer",
    include: isMarried,
  },
  {
    id: "realty-deesp",
    label: "Дееспособность продавца подтверждена (нет ПНД/нарко)",
    group: "Проверка сторон",
    kind: "party",
    why: "Сделка с недееспособным лицом ничтожна.",
    cats: ["realty"],
    perspective: "buyer",
  },
  {
    id: "realty-minors",
    label: "Согласие опеки (если есть несовершеннолетние собственники)",
    group: "Проверка сторон",
    kind: "doc",
    why: "Продажа имущества ребёнка без опеки незаконна.",
    cats: ["realty"],
    perspective: "buyer",
    include: (ctx) =>
      hasAnyField(ctx, ["child_fio", "child_"]) || hasCategory(ctx, "child") || hasCategory(ctx, "heir"),
  },
  {
    id: "realty-representative",
    label: "Доверенность продавца проверена в реестре",
    group: "Государственные проверки",
    kind: "gov",
    govUrl: "https://reestr-dover.ru/",
    govLabel: "reestr-dover.ru",
    why: "Продажа по поддельной доверенности не переоформляет право.",
    cats: ["realty"],
    perspective: "buyer",
    include: hasRepresentative,
  },
  {
    id: "realty-passport",
    label: "Паспорт продавца действителен",
    group: "Проверка сторон",
    kind: "party",
    cats: ["realty"],
    perspective: "buyer",
  },
  {
    id: "realty-raspiska",
    label: "Расписка о получении денег",
    group: "Сопутствующие документы",
    kind: "companion",
    docId: "raspiska-money",
    docLabel: "Сформировать расписку",
    why: "Подтверждает передачу оплаты; критично при наличных.",
    cats: ["realty"],
    perspective: "seller",
  },
  {
    id: "realty-act",
    label: "Акт приёма-передачи квартиры подписан",
    group: "Сопутствующие документы",
    kind: "companion",
    docId: "akt-priema-kvartiry",
    docLabel: "Сформировать акт",
    why: "Фиксирует переход объекта и состояние на момент передачи.",
    cats: ["realty"],
  },
  {
    id: "realty-settlement",
    label: "Безопасная форма расчёта (аккредитив/ячейка/эскроу)",
    group: "Документы на объект",
    kind: "doc",
    why: "Снижает риск непередачи денег или объекта.",
    cats: ["realty"],
  },

  // ---------- ФИНАНСЫ (займы) ----------
  {
    id: "fin-raspiska",
    label: "Расписка о получении денег",
    group: "Сопутствующие документы",
    kind: "companion",
    docId: "raspiska-money",
    docLabel: "Сформировать расписку",
    why: "Письменная расписка — прямое доказательство передачи займа.",
    cats: ["finance"],
    perspective: "seller",
  },

  // ---------- РЕЕСТРЫ (гос. проверки, доступны для всех категорий) ----------
  {
    id: "fns-transparent",
    label: "Проверить организацию в «Прозрачном бизнесе» ФНС",
    group: "Государственные проверки",
    kind: "gov",
    govUrl: "https://bo.nalog.ru/",
    govLabel: "Открыть «Прозрачный бизнес»",
    why: "Показывает адрес массовой регистрации, дисквалифицированных руководителей, долги по налогам, среднесписочную численность.",
    include: (ctx) =>
      hasAnyField(ctx, ["buyer_inn", "seller_inn", "owner_inn", "party_inn", "company_inn"]) ||
      hasCategory(ctx, "legal"),
  },
  {
    id: "mvd-passport",
    label: "Проверить действительность паспорта физлица в МВД",
    group: "Государственные проверки",
    kind: "gov",
    govUrl: "https://сервисы.мвд.рф/info-service-validity-passport",
    govLabel: "Проверка паспорта МВД",
    why: "Сверяет паспорт по базе недействительных (утерянных, просроченных, поддельных).",
    include: (ctx) =>
      hasAnyField(ctx, ["buyer_passport_series", "seller_passport_series", "owner_passport_series", "passport_series"]),
  },
  {
    id: "reestr-zalogov",
    label: "Проверить имущество в реестре уведомлений о залоге (ФНП)",
    group: "Государственные проверки",
    kind: "gov",
    govUrl: "https://reestr-zalogov.ru/search/index",
    govLabel: "Реестр залогов движимого имущества",
    why: "Если имущество в залоге (например, авто по автокредиту) — сделка может быть оспорена залогодержателем.",
    cats: ["auto", "realty", "finance"],
  },
  {
    id: "notary-reestr",
    label: "Проверить доверенность в реестре нотариальных действий",
    group: "Государственные проверки",
    kind: "gov",
    govUrl: "https://reestr-dover.ru/",
    govLabel: "Реестр доверенностей ФНП",
    why: "Подтверждает, что доверенность действующая и не отозвана (ст. 34.2 Основ законодательства о нотариате).",
    include: (ctx) =>
      hasAnyField(ctx, ["representative_basis", "agent_basis", "dovernennost"]) ||
      hasCategory(ctx, "representative") ||
      hasCategory(ctx, "agent"),
  },
];

export function getChecklist(ctx: ChecklistCtx): ChecklistItem[] {
  return CHECKLIST_RULES.filter((r) => {
    if (r.cats && !r.cats.includes(ctx.template.category)) return false;
    if (r.include && !r.include(ctx)) return false;
    return true;
  });
}

export interface ChecklistGroup {
  group: string;
  items: ChecklistItem[];
}

export function groupChecklist(items: ChecklistItem[]): ChecklistGroup[] {
  const order: string[] = [];
  const map: Record<string, ChecklistItem[]> = {};
  for (const it of items) {
    if (!map[it.group]) {
      map[it.group] = [];
      order.push(it.group);
    }
    map[it.group].push(it);
  }
  return order.map((group) => ({ group, items: map[group] }));
}

/** Эффективное выполнение пункта: ручная галочка ИЛИ авто ИЛИ сформирован сопутствующий док. */
export function isItemSatisfied(
  item: ChecklistItem,
  ctx: ChecklistCtx,
  checklist: Record<string, boolean>,
  packTemplateIds: string[]
): boolean {
  if (checklist[item.id]) return true;
  if (item.auto && item.auto(ctx)) return true;
  if (item.docId && packTemplateIds.includes(item.docId)) return true;
  return false;
}
