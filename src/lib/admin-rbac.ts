/**
 * Чистое ядро RBAC админки (без Next-зависимостей — тестируется юнит-тестами).
 *
 * Иерархия ролей (6.5 аудита): superadmin > admin > moderator.
 *  - moderator: тикеты обратной связи, чат поддержки, лиды;
 *  - admin:     + пользователи, подписки, платежи, журнал действий;
 *  - superadmin: + выдача/снятие ролей, удаление фидбека.
 *
 * Источник истины — profiles.admin_role (БД). JWT app_metadata.is_admin
 * остаётся грубым гейтом middleware (вход в /admin), но НЕ определяет роль:
 * все мутирующие операции читают роль из БД на каждую проверку.
 */

export type AdminRole = "superadmin" | "admin" | "moderator";

const ROLE_RANK: Record<AdminRole, number> = {
  moderator: 0,
  admin: 1,
  superadmin: 2,
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: "Суперадмин",
  admin: "Админ",
  moderator: "Модератор",
};

/** Все допустимые значения admin_role из CHECK-констрейнта БД. */
export const ADMIN_ROLES: readonly AdminRole[] = ["superadmin", "admin", "moderator"];

/** Парсит значение колонки admin_role (nullable text) в AdminRole | null. */
export function parseAdminRole(v: unknown): AdminRole | null {
  return typeof v === "string" && (ADMIN_ROLES as readonly string[]).includes(v)
    ? (v as AdminRole)
    : null;
}

/** hasAdminRole("admin", "moderator") === true (admin ≥ moderator). */
export function atLeast(role: AdminRole | null, min: AdminRole): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[min];
}
