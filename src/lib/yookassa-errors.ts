/**
 * Обработка ошибок платёжной системы ЮKassa.
 *
 * Вынесено в отдельный модуль, а не внутрь роута, по двум причинам:
 * 1) тестируемость — роут тянет серверные зависимости (Supabase, rate-limit),
 *    которые не поднимаются в юнит-тестах;
 * 2) единое место для всех платёжных роутов (подписка и пополнение баланса).
 *
 * Контекст: 29.09.2026 оплата подписки была полностью нерабочей. Роут слал
 * `save_payment_method: true`, магазин не подключён к рекуррентным платежам,
 * и ЮKassa отвечала 403 «This store can't make recurring payments». Проверено
 * на живом API: без этого флага платёж создаётся (HTTP 200).
 */

/**
 * Признак того, что магазин не подключён к рекуррентным (автоматическим)
 * платежам. При таком ответе запрос нужно повторить без save_payment_method.
 */
export function isRecurringNotSupported(body: string): boolean {
  return /recurring|recurrent/i.test(body);
}

/**
 * Переводит технические ответы ЮKassa на понятный русский.
 *
 * Раньше текст провайдера показывался пользователю дословно, и на экране
 * появлялось «Не удалось создать платёж: This store can't make recurring
 * payments. Contact the YooMoney manager to learn more» — служебная ошибка
 * с инструкцией самому разработчику вместо оплаты.
 */
export function humanizeYookassaError(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("recurring") || s.includes("recurrent")) {
    return "Платёжная система не поддерживает автопродление на этом магазине. Платёж не создан — попробуйте позже или напишите нам.";
  }
  if (s.includes("limit") || s.includes("too many")) {
    return "Превышен лимит платежей. Попробуйте позже.";
  }
  if (s.includes("amount") && (s.includes("invalid") || s.includes("incorrect"))) {
    return "Некорректная сумма платежа.";
  }
  if (s.includes("card") || s.includes("declined")) {
    return "Платёжная система не приняла карту. Попробуйте другой способ оплаты.";
  }
  if (s.includes("unauthorized") || s.includes("401")) {
    return "Платёжная система временно недоступна.";
  }
  if (s.includes("timeout") || s.includes("503") || s.includes("unavailable")) {
    return "Платёжная система не отвечает. Попробуйте позже.";
  }
  if (s.includes("idempotence") || s.includes("idempotent")) {
    return "Техническая ошибка создания платежа. Подождите минуту и попробуйте ещё раз.";
  }
  return "Платёжная система отклонила платёж. Попробуйте позже или выберите другой способ оплаты.";
}
