import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/trash", "/billing", "/security", "/connections", "/builder"];

function decodeB64url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
  return atob(padded);
}

// Р”РµРєРѕРґРёСЂСѓРµС‚ aal-claim РёР· access token РІ РєСѓРєРµ СЃРµСЃСЃРёРё ("aal1"/"aal2").
// aal2 РѕР·РЅР°С‡Р°РµС‚, С‡С‚Рѕ 2FA (РµСЃР»Рё РІРєР»СЋС‡РµРЅР°) СѓР¶Рµ РїРѕРґС‚РІРµСЂР¶РґРµРЅР° РєРѕРґРѕРј.
function sessionAal(request: NextRequest): "aal1" | "aal2" | null {
  const cookies = request.cookies.getAll();
  // @supabase/ssr С‡Р°РЅРєР°РµС‚ Р±РѕР»СЊС€РёРµ СЃРµСЃСЃРёРё: РєСѓРєР° -auth-token.0, .1, ...
  // РЎРєР»РµРёРІР°РµРј С‡Р°РЅРєРё РїРѕ РёРЅРґРµРєСЃСѓ; РµСЃР»Рё С‡Р°РЅРєРѕРІ РЅРµС‚ вЂ” Р±РµСЂС‘Рј Р±Р°Р·РѕРІСѓСЋ РєСѓРєСѓ.
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
    // @supabase/ssr С…СЂР°РЅРёС‚ СЃРµСЃСЃРёСЋ РІ С„РѕСЂРјР°С‚Рµ "base64-<base64url(JSON)>".
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
 * N2 (independent audit): РµРґРёРЅР°СЏ С„СѓРЅРєС†РёСЏ СѓСЃС‚Р°РЅРѕРІРєРё security-Р·Р°РіРѕР»РѕРІРєРѕРІ.
 * РџСЂРёРјРµРЅСЏРµС‚СЃСЏ РєРѕ Р’РЎР•Рњ response вЂ” РІРєР»СЋС‡Р°СЏ `NextResponse.redirect()`.
 * Р‘РµР· СЌС‚РѕРіРѕ СЂРµРґРёСЂРµРєС‚С‹ С‚РµСЂСЏР»Рё CSP/HSTS/X-Frame вЂ” С‚Рѕ РµСЃС‚СЊ СЃР°РјР° СЃС‚СЂР°РЅРёС†Р°
 * Р»РѕРіРёРЅР° РїСЂРёС…РѕРґРёР»Р° Р±РµР· Р·Р°С‰РёС‚С‹.
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
  // COOP: same-origin-allow-popups РёР·РѕР»РёСЂСѓРµС‚ РѕРєРЅРѕ РѕС‚ cross-origin opener'РѕРІ
  // (СѓРґРѕРІР»РµС‚РІРѕСЂСЏРµС‚ Lighthouse Best Practices), РЅРѕ СЃРѕС…СЂР°РЅСЏРµС‚ РєР°РЅР°Р» СЃРІСЏР·Рё СЃ
  // OAuth-РїРѕРїР°РїР°РјРё (Google GIS, РЇРЅРґРµРєСЃ), РєРѕС‚РѕСЂС‹Рµ Р·Р°РєСЂС‹РІР°СЋС‚СЃСЏ СЃР°РјРё РїРѕ СЃРµР±Рµ вЂ”
  // СЃС‚СЂРѕРіРёР№ same-origin СЂР°Р·СЂС‹РІР°Р» Р±С‹ communication СЃ accounts.google.com.
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  // N8: Permissions-Policy вЂ” Р·Р°РїСЂРµС‰Р°РµРј РґРѕСЃС‚СѓРї Рє РєР°РјРµСЂРµ/РјРёРєСЂРѕС„РѕРЅСѓ/РіРµРѕР»РѕРєР°С†РёРё
  // РґР»СЏ РІСЃРµРіРѕ СЃР°Р№С‚Р°, РµСЃР»Рё СЌС‚Рѕ СЏРІРЅРѕ РЅРµ СЂР°Р·СЂРµС€РµРЅРѕ С‡РµСЂРµР· iframe-allow.
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
  // N12: AI-Р°РіРµРЅС‚Р°Рј (GPTBot, ClaudeBot, PerplexityBot) РґР»СЏ content
  // negotiation РЅСѓР¶РµРЅ Vary: Accept. Р”Р»СЏ HTML-СЃС‚СЂР°РЅРёС† С‚РµРєСѓС‰РёР№ РѕС‚РІРµС‚ РІСЃРµРіРґР°
  // text/html вЂ” Vary РЅРµ Р»РѕРјР°РµС‚ РєСЌС€, РЅРѕ РїРѕР·РІРѕР»СЏРµС‚ Р±СѓРґСѓС‰РёРј РјР°СЂС€СЂСѓС‚Р°Рј
  // РІРѕР·РІСЂР°С‰Р°С‚СЊ text/markdown РїСЂРё Accept: text/markdown Р±РµР· СЂРёСЃРєР°
  // СЃРјРµС€РµРЅРёСЏ РєСЌС€РёСЂРѕРІР°РЅРЅС‹С… РѕС‚РІРµС‚РѕРІ.
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
  // Р”РёРЅР°РјРёС‡РµСЃРєРёР№ nonce + 'strict-dynamic' РќР•РЎРћР’РњР•РЎРўРРњР« СЃРѕ СЃС‚Р°С‚РёС‡РµСЃРєРёРј
  // prerender (SSG/ISR): static-СЃС‚СЂР°РЅРёС†С‹ СЃРѕР±РёСЂР°СЋС‚СЃСЏ Р±РµР· middleware Рё РёС…
  // СЃРєСЂРёРїС‚С‹ РЅРµ РїРѕР»СѓС‡Р°СЋС‚ nonce в†’ Р±СЂР°СѓР·РµСЂ Р±Р»РѕРєРёСЂСѓРµС‚ РІРµСЃСЊ JS (СЃРј. РІ Audit Р·Р°РїРёСЃРё
  // "Executing inline script violates CSP" РЅР° РїСЂРѕРґРµ). РџРѕСЌС‚РѕРјСѓ РґР»СЏ РїСѓР±Р»РёС‡РЅРѕРіРѕ
  // РєРѕРЅС‚РµРЅС‚РЅРѕРіРѕ СЃР°Р№С‚Р° РїСЂРёРјРµРЅСЏРµС‚СЃСЏ РїРѕР»РёС‚РёРєР° РїРѕ РёСЃС‚РѕС‡РЅРёРєР°Рј: 'self' РїРѕРєСЂС‹РІР°РµС‚
  // РІСЃРµ Р±Р°РЅРґР»С‹ /_next/static, 'unsafe-inline' вЂ” РёРЅР»Р°Р№РЅ-СЃРєСЂРёРїС‚С‹ РіРёРґСЂР°С‚Р°С†РёРё
  // Next.js Рё РЇРЅРґРµРєСЃ.РњРµС‚СЂРёРєРё. no-cache РЅР° HTML РЅРµ СЃС‚Р°РІРёРј вЂ” SSG РѕСЃС‚Р°С‘С‚СЃСЏ.
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://inzuro.polis.online https://*.inzuro.ru https://polis.online https://api.polis.online https://challenges.cloudflare.com https://mc.yandex.ru https://mc.yandex.md https://www.cryptopro.ru https://download.rutoken.ru https://accounts.google.com`,
    `worker-src 'self' blob:`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.polis.online https://inzuro.polis.online https://*.inzuro.ru`,
    `img-src 'self' data: blob: https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://xkakhztknlpzqarklewq.supabase.co https://lh3.googleusercontent.com https://avatars.yandex.net https://avatars.mds.yandex.net https://mc.yandex.ru https://mc.yandex.md https://mc.yandex.com`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src 'self' https://accounts.google.com https://www.googleapis.com https://oauth.yandex.ru https://cloud-api.yandex.net https://inzuro.polis.online https://*.inzuro.ru https://polis.online https://api.polis.online https://dkbm-web.autoins.ru https://xkakhztknlpzqarklewq.supabase.co https://tessdata.projectnaptha.com https://challenges.cloudflare.com https://mc.yandex.ru https://mc.yandex.md https://mc.yandex.com https://yandex.ru https://huggingface.co https://*.huggingface.co https://cdn-lfs.huggingface.co https://cdn.hf.co https://*.cdn.hf.co wss://mc.yandex.ru wss://mc.yandex.com wss://mc.yandex.md wss://yandex.ru https://*.ingest.us.sentry.io`,
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

  // ====== РџСѓР±Р»РёС‡РЅС‹Рµ РјР°СЂС€СЂСѓС‚С‹ (N9 + N10) ======
  // /builder, /connections РґРµР»Р°СЋС‚ client-side guard, РїРѕСЌС‚РѕРјСѓ middleware
  // РЅРµ РґРµР»Р°РµС‚ РґР»СЏ РЅРёС… getUser() вЂ” СЌРєРѕРЅРѕРјРёСЏ 50-200 РјСЃ TTFB.
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

// N9: СЃСѓР¶Р°РµРј matcher, С‡С‚РѕР±С‹ middleware РЅРµ Р·Р°РїСѓСЃРєР°Р»СЃСЏ РЅР° СЃС‚Р°С‚РёРєРµ.
// Р­С‚Рѕ СЃРЅРёР¶Р°РµС‚ invocation count Рё TTFB (СЌРєРѕРЅРѕРјРёС‚ 1-3 РјСЃ РЅР° Р·Р°РїСЂРѕСЃ).
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (СЃС‚Р°С‚РёС‡РµСЃРєРёРµ С„Р°Р№Р»С‹ Next.js)
     * - _next/image (image optimization)
     * - favicon.ico, icon, manifest, robots, sitemap, og-image, apple-icon
     * - public/* (РєР°СЂС‚РёРЅРєРё, С€СЂРёС„С‚С‹ Рё С‚.Рґ.)
     * - С„Р°Р№Р»С‹ СЃ СЂР°СЃС€РёСЂРµРЅРёСЏРјРё (jpg, png, css, js, woff, woff2, Рё С‚.Рґ.)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon|manifest|robots|sitemap|og-image|apple-icon|.*\\.).*)",
  ],
};