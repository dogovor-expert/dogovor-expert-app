export const SITE_URL = "https://dogovor.expert";

export const SITE_NAME = "Dogovor.expert — онлайн-конструктор договоров";

export const SITE_DESCRIPTION =
  "Бесплатный конструктор договоров: ДКП, аренда, подряд, счёт. Автозаполнение по ИНН, проверка юристом-роботом, экспорт в PDF и DOCX. Данные остаются в браузере.";

export const SITE_KEYWORDS = [
  "договор онлайн",
  "конструктор договоров",
  "договор купли-продажи",
  "создать договор бесплатно",
  "шаблоны договоров",
  "ДКП автомобиля",
  "договор аренды",
  "расписка",
  "счёт на оплату",
  "генератор документов",
];

export const SITE_CONTACT_EMAIL = "hello@dogovor.expert";

export const SUPPORT_EMAIL = "support@dogovor.expert";

export const PARTNERS_EMAIL = "partners@dogovor.expert";

export const PRESS_EMAIL = "press@dogovor.expert";

export const YANDEX_METRIKA_ID: string = "111811597";

export const SITE_LEGAL_NAME = "Мажаев Алик Рамазанович (самозанятый)";

export const SITE_LEGAL_INN = "480708763065";

/**
 * Единый источник числа шаблонов для UI-строк («N шаблонов»).
 *
 * ЗАЧЕМ: раньше число было захардкожено в текстах страниц («369 шаблонов» на
 * /converter/[tool] и /approve/[token]) и разошлось с реальным каталогом (570).
 *
 * ПОЧЕМУ НЕ `LEGAL_TEMPLATES.length` НАПРЯМУЮ: клиентские компоненты (например
 * `approve/[token]/page.tsx` — "use client") не должны тянуть в бандл все 570
 * шаблонов с полями и превью. Число живёт здесь, а инвариант-тест
 * `src/data/__tests__/templates.test.ts` сверяет его с каталогом при каждом
 * прогоне — дрейф невозможен.
 */
export const TEMPLATE_COUNT = 570;
