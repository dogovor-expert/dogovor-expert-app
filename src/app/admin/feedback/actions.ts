"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin-auth";
import { atLeast, type AdminRole } from "@/lib/admin-rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";
import { sendEmail } from "@/lib/mail";
import {
  assertSameOrigin,
  checkAdminRateLimit,
  parseForm,
} from "@/lib/secure-action";

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

const STATUSES = ["new", "done", "spam"] as const;

// ids приходят как comma-separated string из формы (см. FeedbackAdminTable).
// Ограничиваем 100 идентификаторами и валидируем формат UUID — без этого
// можно было бы впрыснуть SQL-фрагмент в .in("id", ids).
const bulkStatusSchema = z
  .object({
    ids: z
      .string()
      .min(1)
      .max(10000)
      .transform((s) =>
        s
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
          .slice(0, 100)
      )
      .pipe(
        z
          .array(z.string().uuid("id должен быть UUID"))
          .min(1, "ids: хотя бы один UUID")
          .max(100, "ids: максимум 100 за запрос"),
      ),
    status: z.enum(STATUSES),
  })
  .strict();

const replySchema = z
  .object({
    id: z.string().uuid(),
    message: z.string().min(2).max(5000),
  })
  .strict();

// Одна и та же схема UUID-массива для bulk-операций.
const idsOnlySchema = z
  .object({
    ids: z
      .string()
      .min(1)
      .max(10000)
      .transform((s) =>
        s
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
          .slice(0, 100)
      )
      .pipe(
        z
          .array(z.string().uuid("id должен быть UUID"))
          .min(1, "ids: хотя бы один UUID")
          .max(100, "ids: максимум 100 за запрос"),
      ),
  })
  .strict();

async function requireAdmin(minRole?: AdminRole) {
  await assertSameOrigin();
  const admin = await getAdminUser();
  if (!admin) throw new Error("unauthorized");
  // 6.5 RBAC: удаление обращений — только суперадмин (minRole="superadmin").
  if (minRole && !atLeast(admin.role, minRole)) throw new Error("forbidden: недостаточно прав");
  await checkAdminRateLimit(admin.id);
  return admin;
}

export async function bulkFeedbackStatus(formData: FormData): Promise<{ updated: number }> {
  const admin = await requireAdmin();

  const data = parseForm(bulkStatusSchema, formData);
  const sb = createAdminClient();
  // Идемпотентность: строки, у которых целевой статус уже стоит, не
  // перезаписываем (меньше гоннок и записей в audit-log).
  const { data: updatedRows, error } = await sb
    .from("feedback")
    .update({ status: data.status })
    .in("id", data.ids)
    .neq("status", data.status)
    .select("id");
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.id,
    action: "feedback_status",
    resource: "feedback",
    resourceId: data.ids.join(","),
    meta: { status: data.status, count: data.ids.length, changed: updatedRows?.length ?? 0, bulk: true },
  });

  revalidatePath("/admin/feedback");
  return { updated: updatedRows?.length ?? 0 };
}

// 6.8: bulk-удаление заявок. Feedback содержит ПДн (email, текст,
// скриншоты) — удаление физическое, вместе с объектами в приватном
// бакете storage (соответствие требованию на удаление данных).
export async function bulkFeedbackDelete(formData: FormData): Promise<{ deleted: number }> {
  const admin = await requireAdmin("superadmin");

  const data = parseForm(idsOnlySchema, formData);
  const sb = createAdminClient();

  const { data: rows } = await sb
    .from("feedback")
    .select("id, screenshots")
    .in("id", data.ids);
  const { error } = await sb.from("feedback").delete().in("id", data.ids);
  if (error) throw new Error(error.message);

  // Очистка скриншотов — best-effort: заявка уже удалена, ошибку storage
  // не поднимаем (иначе пользователь видел бы «сбой» при успехе).
  const paths = (rows ?? [])
    .flatMap((r: { screenshots?: string[] | null }) =>
      Array.isArray(r.screenshots) ? r.screenshots : [],
    )
    .filter((p: string) => typeof p === "string" && p.length > 0);
  if (paths.length > 0) {
    void sb.storage.from("feedback").remove(paths).catch(() => {});
  }

  await logAdminAction({
    adminId: admin.id,
    action: "feedback_delete",
    resource: "feedback",
    resourceId: data.ids.join(","),
    meta: { count: data.ids.length, bulk: true },
  });

  revalidatePath("/admin/feedback");
  return { deleted: data.ids.length };
}

// 6.8/6.2: удаление одной заявки с очисткой storage.
export async function deleteFeedback(formData: FormData): Promise<{ ok: true }> {
  const admin = await requireAdmin("superadmin");

  const data = parseForm(z.object({ id: z.string().uuid() }).strict(), formData);
  const sb = createAdminClient();

  const { data: row } = await sb
    .from("feedback")
    .select("screenshots")
    .eq("id", data.id)
    .maybeSingle();
  const { error } = await sb.from("feedback").delete().eq("id", data.id);
  if (error) throw new Error(error.message);

  const paths = Array.isArray(row?.screenshots) ? (row.screenshots as string[]) : [];
  if (paths.length > 0) {
    void sb.storage.from("feedback").remove(paths).catch(() => {});
  }

  await logAdminAction({
    adminId: admin.id,
    action: "feedback_delete",
    resource: "feedback",
    resourceId: data.id,
    meta: { bulk: false },
  });

  revalidatePath("/admin/feedback");
  return { ok: true };
}

export async function replyFeedback(formData: FormData) {
  await assertSameOrigin();
  const admin = await getAdminUser();
  if (!admin) throw new Error("unauthorized");
  await checkAdminRateLimit(admin.id);

  const data = parseForm(replySchema, formData);
  const sb = createAdminClient();
  const { data: fb } = await sb.from("feedback").select("*").eq("id", data.id).maybeSingle();
  if (!fb) throw new Error("not found");

  const ticketNo = fb.ticket_no as string;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 12px;color:#111827;">Ответ на обращение ${esc(ticketNo)}</h2>
    <p style="margin:0 0 12px;color:#374151;white-space:pre-wrap;">${esc(data.message)}</p>
    <p style="margin:0;color:#6b7280;font-size:12px;">Команда Dogovor.expert</p>
  </div>`;

  await sendEmail({ to: fb.email as string, subject: `Re: Обращение ${ticketNo}`, html });

  const { error } = await sb.from("feedback").update({ status: "done" }).eq("id", data.id);
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.id,
    action: "feedback_status",
    resource: "feedback",
    resourceId: data.id,
    meta: { replied: true },
  });

  revalidatePath("/admin/feedback");
}
