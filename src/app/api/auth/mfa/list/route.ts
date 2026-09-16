import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Серверный список TOTP-факторов. После OAuth/парольного логина сессия живёт
// в httpOnly-cookies, куда браузерный клиент Supabase доступа не имеет, поэтому
// listFactors() из /login?mfa=1 падал с AuthSessionMissingError. Весь MFA-цикл
// (list → challenge → verify) выполняется на сервере через httpOnly-сессию.
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  const verified = data?.totp?.find((f) => f.status === "verified");
  return NextResponse.json({ factorId: verified?.id ?? null });
}