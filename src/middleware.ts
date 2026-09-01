import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/trash", "/billing", "/security"];

function decodeB64url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
  return atob(padded);
}

// Декодирует aal-claim из access token в куке сессии ("aal1"/"aal2").
// aal2 означает, что 2FA (если включена) уже подтверждена кодом.
function sessionAal(request: NextRequest): "aal1" | "aal2" | null {
  const cookie = request.cookies.getAll().find((c) => c.name.endsWith("-auth-token"));
  if (!cookie) return null;
  try {
    // @supabase/ssr хранит сессию в формате "base64-<base64url(JSON)>".
    const value = cookie.value.startsWith("base64-")
      ? cookie.value.slice("base64-".length)
      : cookie.value;
    let json: string;
    try {
      json = decodeB64url(value);
    } catch {
      json = value;
    }
    const parsed = JSON.parse(json) as { access_token?: string };
    const token = parsed.access_token ?? "";
    const claimsB64 = token.split(".")[1];
    if (!claimsB64) return null;
    const claims = JSON.parse(decodeB64url(claimsB64)) as { aal?: string };
    return claims.aal === "aal2" ? "aal2" : "aal1";
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  // ====== CSP с nonce ======
  // Генерируем уникальный nonce для каждого запроса
  const nonce = Buffer.from(globalThis.crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  // Строим CSP-заголовок с nonce и strict-dynamic
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ''} https://inzuro.polis.online https://*.inzuro.ru https://polis.online https://api.polis.online https://cdn.jsdelivr.net https://unpkg.com https://challenges.cloudflare.com https://mc.yandex.ru https://mc.yandex.md https://www.cryptopro.ru https://download.rutoken.ru`,
    `worker-src 'self' blob: https://cdn.jsdelivr.net https://unpkg.com`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://xkakhztknlpzqarklewq.supabase.co https://lh3.googleusercontent.com https://avatars.yandex.net https://avatars.mds.yandex.net https://mc.yandex.ru https://mc.yandex.md https://mc.yandex.com`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src 'self' https://inzuro.polis.online https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://xkakhztknlpzqarklewq.supabase.co https://cdn.jsdelivr.net https://unpkg.com https://tessdata.projectnaptha.com https://challenges.cloudflare.com https://mc.yandex.ru https://mc.yandex.md https://mc.yandex.com https://yandex.ru https://huggingface.co https://*.huggingface.co wss://mc.yandex.ru https://*.ingest.us.sentry.io`,
    `frame-src 'self' blob: https://widget.inzuro.ru https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://mc.yandex.ru https://challenges.cloudflare.com`,
    `media-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
  ].join('; ');

  // Передаём nonce в Server Components через заголовок
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Устанавливаем CSP-заголовок в ответ
  response.headers.set('Content-Security-Policy', csp);
  // Дополнительные security-заголовки
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  if (!isDev) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // ====== Остальная логика аутентификации ======

  // Публичные маршруты — ранний возврат без обращения к Supabase (экономия 50-200мс TTFB)
  const isPublicRoute = 
    pathname === "/" ||
    pathname.startsWith("/templates") ||
    (pathname.startsWith("/documents/") && pathname !== "/documents/") ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/converter") ||
    pathname.startsWith("/utils") ||
    pathname.startsWith("/osago") ||
    pathname.startsWith("/dkp") ||
    pathname.startsWith("/autoteka") ||
    pathname.startsWith("/techosmotr") ||
    pathname.startsWith("/tahograph") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/help") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/og-image") ||
    pathname.startsWith("/apple-icon");

  if (isPublicRoute) {
    // Для публичных маршрутов тоже возвращаем response с CSP-заголовками
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname === "/documents" ||
    pathname === "/documents/";
  const isAdminPage = pathname.startsWith("/admin");
  const isDebugPage = pathname.startsWith("/debug");

  if (isAdminPage || isDebugPage) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    // Сначала JWT app_metadata (быстро), потом profiles.is_admin (fallback)
    let isAdmin = user.app_metadata?.is_admin === true;
    if (!isAdmin) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
      );
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.is_admin === true;
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Вторая линия защиты: требуем 2FA (aal2).
    // - всегда, если у админа включена MFA;
    // - либо принудительно для всех админов, если ADMIN_REQUIRE_2FA=true.
    const mfaEnabled = user.user_metadata?.mfa_enabled === true;
    const force2fa = process.env.ADMIN_REQUIRE_2FA === "true";
    if ((mfaEnabled || force2fa) && sessionAal(request) !== "aal2") {
      if (mfaEnabled) {
        const url = new URL("/login", request.url);
        url.searchParams.set("mfa", "1");
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
      // 2FA принудительно требуется, но ещё не настроена — отправляем на настройку.
      const url = new URL("/settings/security", request.url);
      url.searchParams.set("enforce_2fa", "1");
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (isProtected && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 2FA включена, но вход ещё не подтверждён кодом аутентификатора (AAL1).
  if (isProtected && user && user.user_metadata?.mfa_enabled === true && sessionAal(request) !== "aal2") {
    const url = new URL("/login", request.url);
    url.searchParams.set("mfa", "1");
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const mfaEnabled = user.user_metadata?.mfa_enabled === true;
    if (!mfaEnabled || sessionAal(request) === "aal2") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

// Middleware теперь применяется ко всем маршрутам, чтобы CSP с nonce действовал везде.
// Публичные маршруты обрабатываются внутри middleware через ранний return.
export const config = {
  matcher: ['/(.*)'],
};