import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { atLeast, parseAdminRole, type AdminRole } from "@/lib/admin-rbac";

export type { AdminRole };

export interface AdminUser {
  id: string;
  email: string | null;
  /** 6.5 RBAC: роль из profiles.admin_role (источник истины — БД, не JWT). */
  role: AdminRole;
}

/**
 * Возвращает текущего админа или null.
 *
 * Флаг is_admin проверяем двумя линиями (JWT app_metadata + profiles как
 * fallback на случай протухшего JWT), НО роль (admin_role) всегда читаем из
 * БД: выдать/снять роль можно мгновенно, без перевыпуска JWT.
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

  // Роль — всегда из profiles (single source of truth, 6.5 RBAC).
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, admin_role")
    .eq("id", user.id)
    .single();

  const jwtAdmin = user.app_metadata?.is_admin === true;
  const dbAdmin = !!profile?.is_admin;
  if (!jwtAdmin && !dbAdmin) return null;

  // Миграция проставила admin_role всем is_admin; если кто-то получил
  // доступ в обход (ручной JWT) — считаем его минимальной ролью.
  const role: AdminRole = parseAdminRole(profile?.admin_role) ?? "moderator";
  return { id: user.id, email: user.email ?? null, role };
}

/**
 * Для Server Component: редиректит не-админа на /dashboard, а админа с
 * недостаточной ролью — на общий экран /admin. Возвращает админа.
 */
export async function requireAdminPage(minRole?: AdminRole): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect("/dashboard");
  if (minRole && !atLeast(admin.role, minRole)) redirect("/admin");
  return admin;
}

/** Для API: возвращает admin-клиент (service role) или null (403 по роли — тоже null). */
export async function requireAdminApi(
  minRole?: AdminRole
): Promise<ReturnType<typeof createAdminClient> | null> {
  const admin = await getAdminUser();
  if (!admin) return null;
  if (minRole && !atLeast(admin.role, minRole)) return null;
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
