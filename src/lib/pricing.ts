/**
 * Единый источник цен и акций.
 *
 * PRO: 299 ₽ по акции, 990 ₽ после её окончания.
 *
 * ⚠️ Почему в интерфейсе НЕТ зачёркнутой «старой цены» 990 ₽:
 * история git показывает, что PRO_PRICE_OLD = 990 и PRO_PRICE = 299 появились
 * ОДНИМ коммитом, то есть 990 ₽ не списывались никогда. Зачёркивание такой
 * цены — ложное утверждение («вы платили 990 ₽»), ровно то же, чем была
 * несуществующая «цена вопроса от 14 ₽». Поэтому акция показывается честно:
 * текущая цена + пометка «Акция», без выдуманной исходной суммы и без
 * процента скидки (PROMO_LABEL тоже не выводит «−70%», оно считалось от
 * несуществующих 990 ₽).
 *
 * Акция живёт до PROMO_ENDS_AT (МСК, env). После этой даты currentProPrice()
 * возвращает PRO_PRICE_OLD, и 990 ₽ становятся обычной ценой — без зачёркивания.
 */
export const PRO_PRICE_OLD = 990;
export const PRO_PRICE = 299;
/** Пометка акции. Не «−70%»: процент считался от несуществовавшей цены 990 ₽. */
export const PROMO_LABEL = "Акция";
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

/**
 * Выписка из ЭПТС — 800 ₽.
 *
 * ⚠️ Раньше цена была зашита в двух местах: литерал `800` в UI
 * (src/app/epts/EptsOrder.tsx) и `EPTS_PRICE = 800` в API-роуте. Правка одного
 * места оставляла второе со старым значением — пользователь видел одну цену,
 * а платёж взимался другой. Теперь источник один.
 *
 * Зачёркнутая «старая цена» 1 200 ₽ в интерфейс не выводится: EPTS_PRICE = 800
 * появился в том же коммите, что и это зачёркивание, то есть 1 200 ₽ никогда
 * не списывались.
 */
export const EPTS_PRICE_RUB = 800;
