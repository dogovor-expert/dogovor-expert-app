/**
 * Тарифы AI-юриста для пользователя (копейки) + себестоимость ProxyAPI.
 * Цены пользователю — из образца ai-yurist-v1.html, менять синхронно.
 */

// --- Цены пользователю (копейки) ---
export const AI_PRICE_MESSAGE_KOPEKS = 1900; // 19 ₽ — текстовый вопрос
export const AI_PRICE_DOC_KOPEKS = 4900; // 49 ₽ — разбор документа до 10 стр
export const AI_PRICE_VIDEO_KOPEKS = 9900; // 99 ₽ — видео/аудио до 3 мин
export const AI_FREE_QUESTIONS = 2; // первые N вопросов — бесплатно
export const AI_MIN_TOPUP_KOPEKS = 10000; // 100 ₽ — мин. пополнение
export const AI_LOW_BALANCE_KOPEKS = 2000; // 20 ₽ — порог «низкий баланс»

// --- Тариф «AI-юрист» (подписка, квоты) ---
export const AI_PLAN_PRICE_RUB = 690; // 690 ₽/мес
export const AI_PLAN_PRICE_KOPEKS = 69000;
export const AI_PLAN_QUESTIONS = 200; // вопросов в месяц, сгорают
export const AI_PLAN_PERIOD_DAYS = 30;

/** Календарный месяц квоты 'YYYY-MM' (UTC — детерминированно для всех). */
export function currentQuotaMonth(date = new Date()): string {
  const m = date.getUTCMonth() + 1;
  return `${date.getUTCFullYear()}-${m < 10 ? "0" + m : m}`;
}

/** Источник оплаты вопроса: квота тарифа → бесплатные → баланс. */
export type QuestionSource = "quota" | "free" | "paid";
export function resolveQuestionSource(args: {
  quotaTotal: number;
  quotaUsed: number;
  freeAsked: number;
}): QuestionSource {
  if (args.quotaTotal > 0 && args.quotaUsed < args.quotaTotal) return "quota";
  if (args.freeAsked < AI_FREE_QUESTIONS) return "free";
  return "paid";
}

// --- Движок (ProxyAPI, цены ₽/1M токенов с НДС) ---
export const AI_MODEL_CHAT = "deepseek/deepseek-v4-flash";
export const AI_MODEL_VISION = "deepseek/deepseek-v4.1-flash";
export const AI_MODEL_EMBEDDING = "openai/text-embedding-3-small";
export const AI_MODEL_STT = "openai/whisper-1";

// Себестоимость ProxyAPI в копейках за 1K токенов (для расчёта маржи в логах).
// V4 Flash: 20/40 ₽/1M → 2/4 коп за 1K.
export const AI_COST_CHAT_IN_KOPEKS_PER_1K = 2;
export const AI_COST_CHAT_OUT_KOPEKS_PER_1K = 4;
export const AI_COST_VISION_IN_KOPEKS_PER_1K = 5; // 41/1M с запасом
export const AI_COST_VISION_OUT_KOPEKS_PER_1K = 17; // 168/1M с запасом
export const AI_COST_EMBED_KOPEKS_PER_1K = 1; // 5.16 ₽/1M с запасом

/** Себестоимость ответа в копейках (верхняя оценка, округление вверх). */
export function estimateCostKopeks(tokensIn: number, tokensOut: number, vision = false): number {
  const inRate = vision ? AI_COST_VISION_IN_KOPEKS_PER_1K : AI_COST_CHAT_IN_KOPEKS_PER_1K;
  const outRate = vision ? AI_COST_VISION_OUT_KOPEKS_PER_1K : AI_COST_CHAT_OUT_KOPEKS_PER_1K;
  return Math.ceil(tokensIn / 1000) * inRate + Math.ceil(tokensOut / 1000) * outRate;
}

export function formatKopeks(kopeks: number): string {
  return `${Math.floor(kopeks / 100)} ₽`;
}

// --- Бонусы пополнения: чем больше сумма, тем дешевле сообщение ---
// Бонус начисляется сверху при зачислении (webhook ai_topup) и виден
// в леджере отдельной записью topup_bonus. Списание всегда фикс 19 ₽.
export const AI_TOPUP_BONUS_TIERS: Array<{ minRub: number; bonusPct: number }> = [
  { minRub: 1000, bonusPct: 30 },
  { minRub: 500, bonusPct: 20 },
  { minRub: 300, bonusPct: 10 },
];

/** Сколько копеек упадёт на баланс при пополнении на amountRub рублей. */
export function creditForTopup(amountRub: number): { creditKopeks: number; bonusKopeks: number } {
  const tier = AI_TOPUP_BONUS_TIERS.find((t) => amountRub >= t.minRub);
  const bonusKopeks = tier ? Math.floor((amountRub * 100 * tier.bonusPct) / 100) : 0;
  return { creditKopeks: amountRub * 100 + bonusKopeks, bonusKopeks };
}

/** Примерное число сообщений за пополнение (для отображения в тарифах). */
export function messagesForTopup(amountRub: number): number {
  return Math.floor(creditForTopup(amountRub).creditKopeks / AI_PRICE_MESSAGE_KOPEKS);
}
