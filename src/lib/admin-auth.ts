import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminUser {
  id: string;
  email: string | null;
}

/**
 * Возвращает текущего админа (по JWT app_metadata.is_admin + флагу profiles.is_admin как fallback)
 * или null. Используется как вторая линия защиты (поверх middleware).
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing environment variables: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          /* чтение сессии в server context */
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Primary check: JWT app_metadata (fast, no DB round-trip)
  if (user.app_metadata?.is_admin === true) {
    return { id: user.id, email: user.email ?? null };
  }

  // Fallback: profiles table (defense in depth, in case JWT is stale)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return null;
  return { id: user.id, email: user.email ?? null };
}

/** Для Server Component: редиректит не-админа. Возвращает админа. */
export async function requireAdminPage(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect("/dashboard");
  return admin;
}

/** Для API: возвращает admin-клиент (service role) или null. */
export async function requireAdminApi(): Promise<ReturnType<typeof createAdminClient> | null> {
  const admin = await getAdminUser();
  if (!admin) return null;
  return createAdminClient();
}

/** Базовая CSRF-защита: разрешаем только same-origin запросы. */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  // Раньше: if (!origin) return true. Это был гэп: атакующий через
  // fetch с credentials:'omit' мог не слать Origin и пройти.
  // Теперь: без Origin — отказ для мутирующих контекстов.
  // Чтение/GET без Origin допустимо (браузер не шлёт Origin на GET same-origin),
  // но конкретные API-роуты дополнительно используют withCsrf.
  if (!origin) return false;
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL || "https://dogovor.expert";
    return new URL(origin).origin === new URL(site).origin;
  } catch {
    return false;
  }
}
