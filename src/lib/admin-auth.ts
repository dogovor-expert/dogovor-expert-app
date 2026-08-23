import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminUser {
  id: string;
  email: string | null;
}

/**
 * Возвращает текущего админа (по сессии из cookie + флагу profiles.is_admin)
 * или null. Используется как вторая линия защиты (поверх middleware).
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  if (!origin) return true; // same-origin навигация/чтение может не слать Origin
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL || "https://dogovor.expert";
    return new URL(origin).origin === new URL(site).origin;
  } catch {
    return false;
  }
}
