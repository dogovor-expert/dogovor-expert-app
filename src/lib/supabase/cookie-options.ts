import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Единые настройки cookie для browser- и server-клиентов @supabase/ssr.
 *
 * httpOnly СОЗНАТЕЛЬНО выключен. `createBrowserClient` читает сессию через
 * `document.cookie`, и браузерной части нужен доступ к refresh-token, чтобы
 * самостоятельно поддерживать сессию. Официальный гайд Supabase
 * (server-side/advanced-guide): «How do I make the cookies HttpOnly? — This is
 * not necessary… the browser-based side of your application needs access to the
 * refresh token to properly maintain a browser session anyway».
 *
 * Раньше server-клиент форсировал `httpOnly: true` (при аудите), из-за чего
 * сессия становилась невидимой для браузера: /security показывал 2FA как
 * выключенную, хедер — «Гость», выход и смена пароля не срабатывали.
 *
 * `secure` включаем только в production, чтобы локальная разработка по
 * http://localhost не теряла cookie.
 */
export const supabaseCookieOptions: CookieOptionsWithName = {
  path: "/",
  sameSite: "lax",
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
};
