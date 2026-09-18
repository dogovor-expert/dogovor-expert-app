"use client";
import { createClient } from "@/lib/supabase/client";

type CookieSession = { access_token: string; refresh_token: string };

// Формат куки @supabase/ssr >= 0.12: значение `base64-<base64url(JSON)>`,
// имя `sb-<ref>-auth-token`; при больших сессиях — чанки `sb-<ref>-auth-token.0..N`
// (в старых версиях разделитель был `-`: `-auth-token-0`). Поддерживаем оба.
export function parseSupabaseAuthCookie(cookieHeader: string): CookieSession | null {
  const chunks = new Map<number, string>();
  let single: string | null = null;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    const m = /^sb-[^=;]+-auth-token(?:[.-](\d+))?$/.exec(name);
    if (!m || !value || value === '""') continue;
    if (m[1] === undefined) single = value;
    else chunks.set(Number(m[1]), value);
  }
  const raw = chunks.size
    ? Array.from(chunks.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, v]) => v)
        .join("")
    : single;
  if (!raw) return null;

  return tryExtractSession(raw);
}

function base64Decode(input: string): string | null {
  try {
    const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? b64 + "=".repeat(4 - (b64.length % 4)) : b64;
    return atob(pad);
  } catch {
    return null;
  }
}

function tryExtractSession(text: string): CookieSession | null {
  const jsonStrings: string[] = [];
  // base64url (как пишет @supabase/ssr >= 0.12) — с префиксом `base64-` или без.
  const b64Body = text.startsWith("base64-") ? text.slice("base64-".length) : text;
  const decodedB64 = base64Decode(b64Body);
  if (decodedB64) jsonStrings.push(decodedB64);
  // Прочие исторические форматы: сырой JSON и URL-encoded JSON.
  jsonStrings.push(text);
  try {
    jsonStrings.push(decodeURIComponent(text));
  } catch {
    /* не url-encoded — ок */
  }

  for (const s of jsonStrings) {
    try {
      let obj: unknown = JSON.parse(s);
      if (typeof obj === "string") obj = JSON.parse(obj);
      const rec =
        typeof obj === "object" && obj !== null
          ? (obj as Record<string, unknown>)
          : null;
      let cur: unknown = rec?.currentSession ?? rec?.session ?? obj;
      if (typeof cur === "string") cur = JSON.parse(cur);
      if (typeof cur === "object" && cur !== null) {
        const c = cur as { access_token?: unknown; refresh_token?: unknown };
        if (typeof c.access_token === "string" && typeof c.refresh_token === "string") {
          return { access_token: c.access_token, refresh_token: c.refresh_token };
        }
      }
    } catch {
      /* перебираем форматы */
    }
  }
  return null;
}

export function clearSupabaseAuthCookies() {
  if (typeof document === "undefined") return;
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (name && /^sb-[^=;]+-auth-token(?:[.-]\d+)?$/.test(name)) {
      document.cookie = `${name}=; path=/; max-age=0`;
      document.cookie = `${name}=; path=/; domain=${location.hostname}; max-age=0`;
    }
  }
}

/**
 * «Призрачная сессия»: сервер (middleware) видит валидную cookie и редиректит
 * /login → /dashboard, а клиентский supabase-клиент сессию не поднял (например,
 * cookie перезаписана server-клиентом после логина) — хедер показывает «Войти»,
 * и пользователь попадает в цикл login→dashboard без формы входа. Восстанавливаем
 * клиентскую сессию из cookie; если она не валидна — чистим cookie, разрывая цикл.
 */
export async function restoreSessionFromCookie(): Promise<boolean> {
  if (typeof document === "undefined") return false;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    if (data.session) return true;
    const cookieSession = parseSupabaseAuthCookie(document.cookie);
    if (!cookieSession) return false;
    const { error } = await supabase.auth.setSession(cookieSession);
    if (error) {
      clearSupabaseAuthCookies();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
