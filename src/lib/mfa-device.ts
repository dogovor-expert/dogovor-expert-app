// «Запомнить это устройство» (P1 remember-device, устройство-привязка по NIST SP 800-63B).
//
// После успешного подтверждения TOTP сервер выдаёт httpOnly-куку вида
//   dogovor_mfa_device = <expEpochMs>.<hex(hmacSha256(secret, userId|exp))>
// Middleware считает требование aal2 выполненным, если подпись верна (проверяется
// серверным секретом MFA_DEVICE_TRUST_SECRET, недоступным клиенту) и срок не истёк.
//
// Почему не токен в user_metadata: пользовательский JS читает СВОИ метаданные через
// supabase.auth.getUser() даже на aal1 (до 2FA) и мог бы скопировать значение в куку —
// это полностью обходило бы 2FA. HMAC-подпись серверным секретом подделать нельзя,
// а привязка к userId не даёт перенести валидную куку между аккаунтами.

export const MFA_DEVICE_COOKIE = "dogovor_mfa_device";
export const MFA_DEVICE_MAX_AGE_S = 60 * 60 * 24 * 30; // 30 дней

const enc = new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Подписывает значение куки для пользователя на указанный срок. */
export async function signDeviceCookie(
  secret: string,
  userId: string,
  expEpochMs: number
): Promise<string> {
  const sig = await hmacHex(secret, `${userId}|${expEpochMs}`);
  return `${expEpochMs}.${sig}`;
}

/**
 * Проверяет куку доверенного устройства. Возвращает false, если секрет не задан
 * (env MFA_DEVICE_TRUST_SECRET) — тогда функция «запомнить устройство» просто
 * выключена и поведение откатывается к строгому aal2 на каждый вход.
 */
export async function verifyDeviceCookie(
  secret: string | undefined,
  userId: string,
  cookieValue: string | undefined,
  nowMs: number = Date.now()
): Promise<boolean> {
  if (!secret || !cookieValue) return false;
  const dot = cookieValue.indexOf(".");
  if (dot <= 0) return false;
  const expStr = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < nowMs) return false;
  // Ограничиваем разумным будущим, чтобы опечатка в exp не дала вечную куку.
  if (exp > nowMs + MFA_DEVICE_MAX_AGE_S * 1000 + 60_000) return false;
  const expected = await hmacHex(secret, `${userId}|${exp}`);
  return timingSafeEqualHex(expected, sig);
}