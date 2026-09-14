/**
 * Серверная верификация Yandex SmartCaptcha (validate).
 * Общий хелпер для публичных форм (auth/login, leads).
 *
 * Возвращает:
 *  - 'ok'          — капча пройдена ИЛИ SMARTCAPTCHA_SECRET_KEY не настроен;
 *  - 'fail'        — SmartCaptcha ответил status != 'ok' (токен неверный/просрочен);
 *  - 'unavailable' — сетевая ошибка/не-2xx от сервиса (решение о fail-open/fail-closed
 *                    принимает вызывающий код).
 */
export type CaptchaVerdict = "ok" | "fail" | "unavailable";

export function smartcaptchaConfigured(): boolean {
  return Boolean(process.env.SMARTCAPTCHA_SECRET_KEY);
}

export async function verifySmartCaptcha(token: string, ip: string): Promise<CaptchaVerdict> {
  const secret = process.env.SMARTCAPTCHA_SECRET_KEY;
  if (!secret) return "ok";
  try {
    const res = await fetch("https://smartcaptcha.yandexcloud.net/validate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, token, ip }).toString(),
      cache: "no-store",
    });
    if (!res.ok) return "unavailable";
    const data = (await res.json()) as { status?: string };
    return data.status === "ok" ? "ok" : "fail";
  } catch {
    return "unavailable";
  }
}
