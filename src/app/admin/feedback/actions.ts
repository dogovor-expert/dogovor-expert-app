"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";
import { sendEmail } from "@/lib/mail";

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

const formStr = (fd: FormData, key: string): string => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

export async function bulkFeedbackStatus(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("unauthorized");

  const idsRaw = formStr(formData, "ids");
  const status = formStr(formData, "status");
  if (!["new", "done", "spam"].includes(status)) throw new Error("bad status");

  const ids = idsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length) return;

  const sb = createAdminClient();
  const { error } = await sb.from("feedback").update({ status }).in("id", ids);
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.id,
    action: "feedback_status",
    resource: "feedback",
    resourceId: ids.join(","),
    meta: { status, count: ids.length, bulk: true },
  });

  revalidatePath("/admin/feedback");
}

export async function replyFeedback(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("unauthorized");

  const id = formStr(formData, "id");
  const message = formStr(formData, "message").trim();
  if (!id || message.length < 2) throw new Error("bad input");

  const sb = createAdminClient();
  const { data: fb } = await sb.from("feedback").select("*").eq("id", id).maybeSingle();
  if (!fb) throw new Error("not found");

  const ticketNo = fb.ticket_no as string;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 12px;color:#111827;">Ответ на обращение ${esc(ticketNo)}</h2>
    <p style="margin:0 0 12px;color:#374151;white-space:pre-wrap;">${esc(message)}</p>
    <p style="margin:0;color:#6b7280;font-size:12px;">Команда Dogovor.expert</p>
  </div>`;

  await sendEmail({ to: fb.email as string, subject: `Re: Обращение ${ticketNo}`, html });

  const { error } = await sb.from("feedback").update({ status: "done" }).eq("id", id);
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.id,
    action: "feedback_status",
    resource: "feedback",
    resourceId: id,
    meta: { replied: true },
  });

  revalidatePath("/admin/feedback");
}
