import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/trash", "/billing", "/security", "/connections", "/builder"];

function decodeB64url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
  return atob(padded);
}

// Декодирует aal-claim из access token в куке сессии ("aal1"/"aal2").
// aal2 означает, что 2FA (если включена) уже подтверждена кодом.
function sessionAal(request: NextRequest): "aal1" | "aal2" | null {
  const cookies = request.cookies.getAll();
  // @supabase/ssr чанкает большие сессии: кука -auth-token.0, .1, ...
  // Склеиваем чанки по индексу; если чанков нет — берём базовую куку.
  const chunks = cookies
    .filter((c) => /-auth-token\.\d+$/.test(c.name))
    .sort(
      (a, b) =>
        Number(a.name.split(".").pop()) - Number(b.name.split(".").pop())
    );
  const base = cookies.find((c) => c.name.endsWith("-auth-token"));
  const raw = chunks.length > 0 ? chunks.map((c) => c.value).join("") : base?.value;
  if (!raw) return null;
  try {
    // @supabase/ssr хранит сессию в формате "base64-<base64url(JSON)>".
    const value = raw.startsWith("base64-") ? raw.slice("base64-".length) : raw;
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

/**
 * N2 (independent audit): единая функция установки security-заголовков.
 * Применяется ко ВСЕМ response — включая `NextResponse.redirect()`.
 * Без этого редиректы теряли CSP/HSTS/X-Frame — то есть сама страница
 * логина приходила без защиты.
 */
function withSecurityHeaders(
  res: NextResponse,
  csp: string,
  isDev: boolean
): NextResponse {
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  // COOP: same-origin-allow-popups изолирует окно от cross-origin opener'ов
  // (удовлетворяет Lighthouse Best Practices), но сохраняет канал связи с
  // OAuth-попапами (Google GIS, Яндекс), которые закрываются сами по себе —
  // строгий same-origin разрывал бы communication с accounts.google.com.
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  // N8: Permissions-Policy — запрещаем доступ к камере/микрофону/геолокации
  // для всего сайта, если это явно не разрешено через iframe-allow.
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  if (!isDev) {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  return res;
}

function withVaryAccept(res: NextResponse): NextResponse {
  // N12: AI-агентам (GPTBot, ClaudeBot, PerplexityBot) для content
  // negotiation нужен Vary: Accept. Для HTML-страниц текущий ответ всегда
  // text/html — Vary не ломает кэш, но позволяет будущим маршрутам
  // возвращать text/markdown при Accept: text/markdown без риска
  // смешивания кэшированных ответов.
  const existing = res.headers.get("Vary");
  if (!existing) {
    res.headers.set("Vary", "Accept");
  } else if (!existing.toLowerCase().split(",").map((s) => s.trim()).includes("accept")) {
    res.headers.set("Vary", `${existing}, Accept`);
  }
  return res;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // ====== CSP (source-based) ======
  // Динамический nonce + 'strict-dynamic' НЕСОВМЕСТИМЫ со статическим
  // prerender (SSG/ISR): static-страницы собираются без middleware и их
  // скрипты не получают nonce → браузер блокирует весь JS (см. в Audit записи
  // "Executing inline script violates CSP" на проде). Поэтому для публичного
  // контентного сайта применяется политика по источникам: 'self' покрывает
  // все бандлы /_next/static, 'unsafe-inline' — инлайн-скрипты гидратации
  // Next.js и Яндекс.Метрики. no-cache на HTML не ставим — SSG остаётся.
  const isDev = process.env.NODE_ENV === 'development';

  // Self-hosted Supabase: env-хост добавляется в img/connect-src аддитивно,
  // чтобы одна конфигурация работала и на Vercel (облако), и на self-hosted.
  const supabaseCspHost = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    .replace(/^https?:\/\//, '')
    .split('/')[0];

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://inzuro.polis.online https://*.inzuro.ru https://polis.online https://api.polis.online https://challenges.cloudflare.com https://mc.yandex.ru https://mc.yandex.md https://www.cryptopro.ru https://download.rutoken.ru https://accounts.google.com`,
    `worker-src 'self' blob:`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.polis.online https://inzuro.polis.online https://*.inzuro.ru`,
    `img-src 'self' data: blob: https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://xkakhztknlpzqarklewq.supabase.co${supabaseCspHost ? ` ${supabaseCspHost.startsWith('http') ? supabaseCspHost : `https://${supabaseCspHost}`} http://${supabaseCspHost}` : ''} https://lh3.googleusercontent.com https://avatars.yandex.net https://avatars.mds.yandex.net https://mc.yandex.ru https://mc.yandex.md https://mc.yandex.com`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src 'self' https://accounts.google.com https://www.googleapis.com https://oauth.yandex.ru https://cloud-api.yandex.net https://inzuro.polis.online https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://xkakhztknlpzqarklewq.supabase.co${supabaseCspHost ? ` ${supabaseCspHost.startsWith('http') ? supabaseCspHost : `https://${supabaseCspHost}`} http://${supabaseCspHost}` : ''} https://tessdata.projectnaptha.com https://challenges.cloudflare.com https://mc.yandex.ru https://mc.yandex.md https://mc.yandex.com https://yandex.ru https://huggingface.co https://*.huggingface.co https://cdn-lfs.huggingface.co https://cdn.hf.co https://*.cdn.hf.co wss://mc.yandex.ru wss://mc.yandex.com wss://mc.yandex.md wss://yandex.ru https://*.ingest.us.sentry.io`,
    `frame-src 'self' blob: https://widget.inzuro.ru https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://mc.yandex.ru https://challenges.cloudflare.com https://accounts.google.com`,
    `media-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
  ].join('; ');

  let response = NextResponse.next();
  response = withSecurityHeaders(response, csp, isDev);
  response = withVaryAccept(response);

  // ====== Публичные маршруты (N9 + N10) ======
  // /builder, /connections делают client-side guard, поэтому middleware
  // не делает для них getUser() — экономия 50-200 мс TTFB.
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
    pathname.startsWith("/apple-icon") ||
    pathname === "/builder" ||
    pathname.startsWith("/builder/");

  if (isPublicRoute) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          const newResponse = NextResponse.next();
          for (const [key, value] of response.headers) {
            if (key.toLowerCase() === "set-cookie") continue;
            newResponse.headers.set(key, value);
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            newResponse.cookies.set(name, value, options)
          );
          response = newResponse;
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
    if (!user) return withVaryAccept(withSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)), csp, isDev));
    let isAdmin = user.app_metadata?.is_admin === true;
    if (!isAdmin) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
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
      return withVaryAccept(withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)), csp, isDev));
    }
    const mfaEnabled = user.user_metadata?.mfa_enabled === true;
    const force2fa = process.env.ADMIN_REQUIRE_2FA === "true";
    if ((mfaEnabled || force2fa) && sessionAal(request) !== "aal2") {
      if (mfaEnabled) {
        const url = new URL("/login", request.url);
        url.searchParams.set("mfa", "1");
        url.searchParams.set("next", pathname);
        return withVaryAccept(withSecurityHeaders(NextResponse.redirect(url), csp, isDev));
      }
      const url = new URL("/settings/security", request.url);
      url.searchParams.set("enforce_2fa", "1");
      return withVaryAccept(withSecurityHeaders(NextResponse.redirect(url), csp, isDev));
    }
    return response;
  }

  if (isProtected && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return withVaryAccept(withSecurityHeaders(NextResponse.redirect(url), csp, isDev));
  }

  if (isProtected && user && user.user_metadata?.mfa_enabled === true && sessionAal(request) !== "aal2") {
    const url = new URL("/login", request.url);
    url.searchParams.set("mfa", "1");
    url.searchParams.set("next", pathname);
    return withVaryAccept(withSecurityHeaders(NextResponse.redirect(url), csp, isDev));
  }

  if (user && pathname === "/login") {
    const mfaEnabled = user.user_metadata?.mfa_enabled === true;
    if (!mfaEnabled || sessionAal(request) === "aal2") {
      return withVaryAccept(withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)), csp, isDev));
    }
  }

  return response;
}

// N9: сужаем matcher, чтобы middleware не запускался на статике.
// Это снижает invocation count и TTFB (экономит 1-3 мс на запрос).
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (статические файлы Next.js)
     * - _next/image (image optimization)
     * - favicon.ico, icon, manifest, robots, sitemap, og-image, apple-icon
     * - public/* (картинки, шрифты и т.д.)
     * - файлы с расширениями (jpg, png, css, js, woff, woff2, и т.д.)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon|manifest|robots|sitemap|og-image|apple-icon|.*\\.).*)",
  ],
};