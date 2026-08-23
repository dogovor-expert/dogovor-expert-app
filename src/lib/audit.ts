import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Тампер-резистентный audit log админских действий.
 * Не должен ломать основную операцию при сбое записи.
 */
export async function logAdminAction(params: {
  adminId: string;
  action: string;
  resource: string;
  resourceId?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from("admin_audit").insert({
      admin_id: params.adminId,
      action: params.action,
      resource: params.resource,
      resource_id: params.resourceId ?? null,
      meta: params.meta ?? null,
    });
  } catch {
    /* аудит не должен блокировать действие */
  }
}
