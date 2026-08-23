// Единый источник правды о ролях сторон сделки.
//
// Раньше «роль» определялась несколькими независимыми способами, которые
// расходились:
//   1) label поля в форме (штучно в каждом шаблоне),
//   2) заголовок секции/вкладки формы (TAB_LABELS в FormSection.tsx),
//   3) список PERSON_ROLES в docRequirements.ts (сканер/«Сохранённые лица»),
//   4) SIGNING_META (автоген, блок подписания),
//   5) тело документа (previewTemplate, эталон).
// Теперь базовая метаданные роли живут здесь, и ВСЕ каналы читают отсюда:
//   - label      — родительный падеж («Паспорт <кого>»), для лейблов полей;
//   - nominative — именительный падеж («Доверитель»), для заголовков секций
//                  и блока подписания;
//   - isDriver   — роль реально управляет ТС и получает плитку «ВУ».
//
// ВАЖНО: «agent»/«Представитель» — НЕ водитель (см. жалобу на
// «Доверенность на управление ТС»), поэтому isDriver:false, хотя документ
// касается управления ТС.

export interface RoleMeta {
  /** Родительный падеж, напр. «Доверителя» (для «ФИО Доверителя»). */
  label: string;
  /** Именительный падеж, напр. «Доверитель» (для заголовка секции). */
  nominative: string;
  /** Роль управляет ТС и должна показывать плитку водительского удостоверения. */
  isDriver: boolean;
}

export const ROLE_REGISTRY: Record<string, RoleMeta> = {
  seller: { label: "Продавца", nominative: "Продавец", isDriver: false },
  buyer: { label: "Покупателя", nominative: "Покупатель", isDriver: false },
  owner: { label: "Владельца", nominative: "Владелец", isDriver: false },
  driver: { label: "Водителя", nominative: "Водитель", isDriver: true },
  principal: { label: "Доверителя", nominative: "Доверитель", isDriver: false },
  agent: { label: "Представителя", nominative: "Представитель", isDriver: false },
  lender: { label: "Займодавца", nominative: "Займодавец", isDriver: false },
  borrower: { label: "Заёмщика", nominative: "Заёмщик", isDriver: false },
  donor: { label: "Дарителя", nominative: "Даритель", isDriver: false },
  donee: { label: "Одаряемого", nominative: "Одаряемый", isDriver: false },
  landlord: { label: "Арендодателя", nominative: "Арендодатель", isDriver: false },
  tenant: { label: "Арендатора", nominative: "Арендатор", isDriver: true },
  testator: { label: "Наследодателя", nominative: "Наследодатель", isDriver: false },
  heir: { label: "Наследника", nominative: "Наследник", isDriver: false },
  employer: { label: "Работодателя", nominative: "Работодатель", isDriver: false },
  employee: { label: "Работника", nominative: "Работник", isDriver: true },
  executor: { label: "Исполнителя", nominative: "Исполнитель", isDriver: false },
  customer: { label: "Заказчика", nominative: "Заказчик", isDriver: false },
  contractor: { label: "Подрядчика", nominative: "Подрядчик", isDriver: false },
  spouse: { label: "Супруга(и)", nominative: "Супруг(а)", isDriver: false },
  applicant: { label: "Заявителя", nominative: "Заявитель", isDriver: false },
  guarantor: { label: "Поручителя", nominative: "Поручитель", isDriver: false },
  payer: { label: "Плательщика", nominative: "Плательщик", isDriver: false },
  recipient: { label: "Получателя", nominative: "Получатель", isDriver: false },
  sender: { label: "Отправителя", nominative: "Отправитель", isDriver: false },
};

export function getRoleMeta(prefix: string): RoleMeta | undefined {
  return ROLE_REGISTRY[prefix];
}
