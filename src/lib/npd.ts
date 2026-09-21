/**
 * Проверка статуса самозанятого (налог на профессиональный доход) через
 * официальный публичный API ФНС России.
 *
 * Документация: «Описание API публичного сервиса ФНС России «Проверка статуса
 * налогоплательщика налога на профессиональный доход (самозанятого)»»
 * (npd.nalog.ru).
 *
 *   POST https://statusnpd.nalog.ru/api/v1/tracker/taxpayer_status
 *   body: { inn: string, requestDate: "YYYY-MM-DD" }
 *   200:  { status: boolean, message: string }
 *   422:  { code: "validation.failed"
 *               | "taxpayer.status.service.unavailable.error"
 *               | "taxpayer.status.service.limited.error", message: string }
 *
 * Особенности сервиса:
 *  - CORS не поддерживается → вызов только с нашего сервера (/api/npd);
 *  - requestDate не раньше 01.01.2019 и не позже текущего дня (МСК);
 *  - есть лимит запросов с одного IP → на сервере кэшируем и ограничиваем.
 *
 * Здесь только чистые функции (без сети) — их и покрывают тесты.
 */
import { isValidInn } from "@/lib/inn";

export const NPD_ENDPOINT =
  "https://statusnpd.nalog.ru/api/v1/tracker/taxpayer_status";

/** Минимальная дата, которую принимает сервис ФНС. */
export const NPD_MIN_DATE = "2019-01-01";

export type NpdState =
  | "self-employed"
  | "not-self-employed"
  | "invalid"
  | "unavailable"
  | "rate-limited";

export interface NpdResult {
  state: NpdState;
  /** true только для подтверждённого плательщика НПД. */
  isSelfEmployed: boolean;
  message: string;
}

/** Сегодняшняя дата по Москве в формате YYYY-MM-DD (ФНС принимает не позже сегодня). */
export function todayMoscow(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Нормализует дату проверки: пустая → сегодня (МСК); иначе проверяет формат,
 * диапазон (01.01.2019 … сегодня) и реальность даты (31 февраля отбрасываем).
 * Возвращает null, если дата недопустима.
 */
export function normalizeNpdDate(
  date: string | undefined,
  now: Date = new Date()
): string | null {
  const today = todayMoscow(now);
  const value =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today;
  // Строковое сравнение корректно для формата YYYY-MM-DD.
  if (value < NPD_MIN_DATE || value > today) return null;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return value;
}

/** Тело запроса к сервису ФНС. */
export function buildNpdPayload(
  inn: string,
  date: string
): { inn: string; requestDate: string } {
  return { inn, requestDate: date };
}

/**
 * Разбирает ответ ФНС в нормализованный результат. Ошибки приходят как
 * `{ code, message }`, успех — как `{ status, message }`.
 */
export function interpretNpdResponse(
  httpStatus: number,
  body: unknown
): NpdResult {
  const rec = (body && typeof body === "object" ? body : {}) as Record<
    string,
    unknown
  >;
  const message = typeof rec.message === "string" ? rec.message : "";
  const code = typeof rec.code === "string" ? rec.code : "";

  if (httpStatus === 200) {
    if (rec.status === true) {
      return { state: "self-employed", isSelfEmployed: true, message };
    }
    if (rec.status === false) {
      return { state: "not-self-employed", isSelfEmployed: false, message };
    }
  }
  if (code === "taxpayer.status.service.limited.error") {
    return { state: "rate-limited", isSelfEmployed: false, message };
  }
  if (code === "validation.failed") {
    return { state: "invalid", isSelfEmployed: false, message };
  }
  return { state: "unavailable", isSelfEmployed: false, message };
}

/** Проверяет, что ИНН пригоден для проверки НПД (только физлица — 12 цифр). */
export function isNpdInn(inn: string): boolean {
  const digits = inn.replace(/\D/g, "");
  return digits.length === 12 && isValidInn(digits);
}
