import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(next: string | null | undefined): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

function secureRedirect(location: string): NextResponse {
  // N2 (independent audit): redirect() не наследует заголовки middleware,
  // потому что этот роут — auth/callback (не под matcher в некоторых конфигах).
  // Ставим минимальный набор security headers вручную.
  const res = NextResponse.redirect(location);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  return res;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return secureRedirect(`${origin}${next}`);
    }
    return secureRedirect(`${origin}/login?error=oauth&next=${encodeURIComponent(next)}`);
  }

  return secureRedirect(`${origin}/login?error=no_code`);
}