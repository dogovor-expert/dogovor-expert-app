/**
 * Единый источник цен и акций.
 * Акция: PRO 299 ₽ вместо 990 ₽. Акция для новых пользователей — идёт до
 * PROMO_ENDS_AT (МСК). Таймер срочности — плавающее окно 12 ч: обратный
 * отсчёт всегда показывает < 12 ч до ближайшего рубежа (00:00/12:00 МСК),
 * по рубежу окно обновляется. По истечении PROMO_ENDS_AT платёж автоматически
 * вернётся к PRO_PRICE_OLD.
 */
export const PRO_PRICE_OLD = 990;
export const PRO_PRICE = 299;
export const PROMO_LABEL = "−70%";
// M13: дата окончания акции вынесена в env (PROMO_ENDS_AT, ISO-строка),
// чтобы не править код при продлении/смене акции. Fallback — текущее значение.
// ВАЖНО: цену показывают КЛИЕНТСКИЕ компоненты (/login, /dashboard, /billing,
// PromoPill), поэтому нужна и NEXT_PUBLIC_копия — иначе в браузере
// process.env.PROMO_ENDS_AT === undefined и акция молча выключается в UI.
const PROMO_ENDS_RAW =
  process.env.NEXT_PUBLIC_PROMO_ENDS_AT ?? process.env.PROMO_ENDS_AT;
export const PROMO_ENDS_AT = PROMO_ENDS_RAW
  ? new Date(PROMO_ENDS_RAW).getTime()
  : new Date("2026-09-20T23:59:59+03:00").getTime();

export const isPromoActive = (): boolean => Date.now() < PROMO_ENDS_AT;

export const currentProPrice = (): number =>
  isPromoActive() ? PRO_PRICE : PRO_PRICE_OLD;

/**
 * Дедлайн акции словами для UI: «20 сентября».
 *
 * ЗАЧЕМ: в `/billing` был захардкожен текст «успевайте до 20 сентября» —
 * при повторном включении акции с другой датой на странице появлялся бы ложный
 * дедлайн. Единый источник — PROMO_ENDS_AT (env NEXT_PUBLIC_PROMO_ENDS_AT).
 * Локаль фиксирована (ru-RU), чтобы SSR и клиент не расходились из-за таймзоны.
 */
export const promoDeadlineLabel = (date = new Date(PROMO_ENDS_AT)): string =>
  date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" });

const PROMO_SLOT_MS = 12 * 3600 * 1000;
const SLOT_ALIGN_MS = 9 * 3600 * 1000;

export const promoCountdownTarget = (now = Date.now()): number => {
  const rem =
    (SLOT_ALIGN_MS - (now % PROMO_SLOT_MS) + PROMO_SLOT_MS) % PROMO_SLOT_MS;
  const nextBoundary = now + (rem === 0 ? PROMO_SLOT_MS : rem);
  return Math.min(nextBoundary, PROMO_ENDS_AT);
};

export const formatRub = (n: number): string =>
  `${n.toLocaleString("ru-RU")} ₽`;