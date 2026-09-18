import { createAdminClient } from "@/lib/supabase/admin";
import { parseAdminRole, type AdminRole } from "@/lib/admin-rbac";

export interface DirectoryUser {
  id: string;
  email: string;
  full_name: string;
  company: string;
  inn: string;
  phone: string;
  is_admin: boolean;
  /** 6.5 RBAC: роль из profiles.admin_role (null = не админ). */
  admin_role: AdminRole | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface Directory {
  users: DirectoryUser[];
  emailById: Map<string, string>;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  company: string | null;
  inn: string | null;
  phone: string | null;
  is_admin: boolean | null;
  admin_role: unknown;
}

/**
 * Справочник пользователей: объединяет auth.users (email, last_sign_in)
 * и profiles (full_name, company, is_admin). Используется админ-страницами.
 */
export async function getDirectory(): Promise<Directory> {
  const admin = createAdminClient();
  const [{ data: authData }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    admin.from("profiles").select("id, full_name, company, inn, phone, is_admin, admin_role, created_at"),
  ]);

  const authUsers = (authData?.users ?? []) as Array<{
    id: string;
    email?: string;
    created_at?: string;
    last_sign_in_at?: string | null;
  }>;
  const profRows = (profiles ?? []) as ProfileRow[];
  const profMap = new Map(profRows.map((p) => [p.id, p]));

  const users: DirectoryUser[] = authUsers.map((u) => {
    const p = profMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      full_name: p?.full_name ?? "",
      company: p?.company ?? "",
      phone: p?.phone ?? "",
      inn: p?.inn ?? "",
      is_admin: p?.is_admin ?? false,
      admin_role: parseAdminRole(p?.admin_role) ?? null,
      created_at: u.created_at ?? "",
      last_sign_in_at: u.last_sign_in_at ?? null,
    };
  });

  const emailById = new Map(users.map((u) => [u.id, u.email]));
  return { users, emailById };
}
