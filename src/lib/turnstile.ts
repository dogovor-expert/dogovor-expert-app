/**
 * Серверная верификация Cloudflare Turnstile (siteverify).
 * Общий хелпер для публичных форм (auth/login, leads).
 *
 * Возвращает:
 *  - 'ok'          — капча пройдена ИЛИ TURNSTILE_SECRET_KEY не настроен;
 *  - 'fail'        — Cloudflare ответил success:false (токен неверный/просрочен);
 *  - 'unavailable' — сетевой ошибки/не-2xx от CF (решение о fail-open/fail-closed
 *                    принимает вызывающий код).
 */
export type TurnstileVerdict = "ok" | "fail" | "unavailable";

export function turnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token: string, ip: string): Promise<TurnstileVerdict> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return "ok";
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }).toString(),
      cache: "no-store",
    });
    if (!res.ok) return "unavailable";
    const data = (await res.json()) as { success: boolean };
    return data.success ? "ok" : "fail";
  } catch {
    return "unavailable";
  }
}
