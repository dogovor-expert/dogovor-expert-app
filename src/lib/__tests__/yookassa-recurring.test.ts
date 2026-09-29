import { describe, it, expect } from "vitest";
import { isRecurringNotSupported, humanizeYookassaError } from "@/lib/yookassa-errors";

/**
 * Регрессия 2026-09-29: оплата подписки была полностью нерабочей.
 *
 * Роут отправлял в ЮKassa `save_payment_method: true`. Магазин не подключён
 * к рекуррентным платежам, поэтому API отвечал 403
 * «This store can't make recurring payments», и пользователь видел эту
 * служебную ошибку вместо оплаты. Проверено на живом API: без этого флага
 * платёж создаётся (HTTP 200).
 *
 * Эти тесты фиксируют решение: распознаём такой отказ и повторяем запрос
 * БЕЗ сохранения карты, а пользователю показываем русский текст.
 */
describe("ЮKassa: неподдержка рекуррентных платежей", () => {
  const RECURRING_ERROR =
    "This store can't make recurring payments. Contact the YooMoney manager to learn more";

  it("распознаёт реальный ответ YooKassa о рекуррентных платежах", () => {
    expect(isRecurringNotSupported(RECURRING_ERROR)).toBe(true);
  });

  it("не принимает обычные ошибки за проблему рекуррентов", () => {
    expect(isRecurringNotSupported('{"id":"1","status":"pending"}')).toBe(false);
    expect(isRecurringNotSupported("Payment was not found")).toBe(false);
    expect(isRecurringNotSupported("Exceeded limit")).toBe(false);
  });

  it("переводит ошибку рекуррентов на русский для пользователя", () => {
    const msg = humanizeYookassaError(RECURRING_ERROR);
    expect(msg).toContain("Платёжная система");
    // Главное: служебный текст провайдера не должен попадать в интерфейс.
    expect(msg).not.toMatch(/YooMoney|recurring/i);
  });

  it("не показывает английские служебные тексты ни в одном сценарии", () => {
    const cases = [
      "Too many requests",
      "Invalid amount",
      "Card declined",
      "Unauthorized",
      "Service unavailable",
      "что-то неожиданное",
    ];
    for (const raw of cases) {
      const msg = humanizeYookassaError(raw);
      expect(msg, raw).not.toMatch(/[A-Za-z]{3,}/);
    }
  });

  it("на любой строке возвращает непустое сообщение", () => {
    for (const raw of ["", "???", "{}", "Internal Server Error"]) {
      expect(humanizeYookassaError(raw).length).toBeGreaterThan(10);
    }
  });
});
