import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = new Set(["/login"]);
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

  // Публичные маршруты — ранний возврат без обращения к Supabase (экономия 50-200мс TTFB)
  const isPublicRoute = 
    pathname === "/" ||
    pathname.startsWith("/templates") ||
    pathname.startsWith("/documents/") && !pathname.startsWith("/documents") ||
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
    // Проверяем is_admin в JWT app_metadata (быстро, без запроса к БД)
    const isAdmin = user.app_metadata?.is_admin === true;
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

export const config = {
  matcher: [
    "/login/:path*",
    "/dashboard/:path*",
    "/documents/:path*",
    "/settings/:path*",
    "/trash/:path*",
    "/billing/:path*",
    "/security/:path*",
    "/admin/:path*",
    "/debug/:path*",
  ],
};