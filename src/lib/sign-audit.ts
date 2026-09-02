import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Аудит действий с электронной подписью.
 *
 * Пишет в таблицу `public.sign_audit` (миграция 20260903_signatures.sql).
 * Раньше для этих целей использовался `logAdminAction`, но это неверно:
 * подписывает рядовой пользователь, а таблица админского аудита
 * предполагает, что adminId — администратор. Из-за этого отчёты в админке
 * показывали действия обычных пользователей как действия администраторов.
 *
 * Ошибки логирования не должны ронять основной сценарий — подпись уже
 * сохранена, и отказ из-за недоступности аудита был бы хуже.
 */

export type SignAuditAction = "prepare" | "accept" | "download" | "verify";

export interface SignAuditEntry {
  userId: string | null;
  documentId: string | null;
  action: SignAuditAction;
  documentHash?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  meta?: Record<string, unknown>;
}

export async function logSignAction(entry: SignAuditEntry): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("sign_audit").insert({
      user_id: entry.userId,
      document_id: entry.documentId,
      action: entry.action,
      document_hash_sha256: entry.documentHash ?? null,
      ip: entry.ip ?? null,
      user_agent: entry.userAgent ?? null,
      meta: entry.meta ?? null,
    });

    if (error) {
      console.error("[sign-audit] insert failed:", error.message);
    }
  } catch (e) {
    console.error(
      "[sign-audit] unexpected error:",
      e instanceof Error ? e.message : e
    );
  }
}
