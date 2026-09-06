"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";
import {
  assertSameOrigin,
  checkAdminRateLimit,
  parseForm,
} from "@/lib/secure-action";

// Все принимаемые поля валидируются через Zod (защита от unknown-полей
// и неожиданных типов). Поля помечены .optional() — форма может прислать
// только часть из них (PATCH-семантика).
const updateProfileSchema = z
  .object({
    id: z.string().uuid(),
    full_name: z.string().min(1).max(100).optional(),
    company: z.string().max(200).optional(),
    inn: z
      .string()
      .regex(/^\d{10}$|^\d{12}$/, "ИНН: 10 или 12 цифр")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    phone: z
      .string()
      .regex(/^\+?\d{10,15}$/, "Телефон: 10–15 цифр, опц. +")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .strict();

const toggleAdminSchema = z
  .object({
    id: z.string().uuid(),
    make_admin: z
      .union([z.literal("true"), z.literal("false")])
      .transform((v) => v === "true"),
  })
  .strict();

const updateSubscriptionSchema = z
  .object({
    user_id: z.string().uuid(),
    plan: z.string().min(1).max(50),
    status: z.enum(["active", "inactive", "trialing", "canceled", "past_due"]),
    auto_renewal: z
      .union([z.literal("true"), z.literal("false")])
      .transform((v) => v === "true"),
    period_end: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате YYYY-MM-DD")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .strict();

export async function updateProfile(formData: FormData) {
  // 1. CSRF
  await assertSameOrigin();
  // 2. Авторизация
  const admin = await getAdminUser();
  if (!admin) throw new Error("unauthorized");
  // 3. Rate-limit per admin.id
  await checkAdminRateLimit(admin.id);
  // 4. Zod-валидация входа
  const data = parseForm(updateProfileSchema, formData);

  const sb = createAdminClient();
  const update: Record<string, string> = {};
  if (data.full_name !== undefined) update.full_name = data.full_name;
  if (data.company !== undefined) update.company = data.company;
  if (data.inn !== undefined) update.inn = data.inn;
  if (data.phone !== undefined) update.phone = data.phone;

  const { error } = await sb
    .from("profiles")
    .update(update)
    .eq("id", data.id);
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.id,
    action: "profile_update",
    resource: "profiles",
    resourceId: data.id,
    meta: update,
  });

  revalidatePath("/admin/users/" + data.id);
  revalidatePath("/admin/users");
}

export async function toggleAdminUser(formData: FormData) {
  await assertSameOrigin();
  const admin = await getAdminUser();
  if (!admin) throw new Error("unauthorized");
  await checkAdminRateLimit(admin.id);

  const data = parseForm(toggleAdminSchema, formData);
  // Анти-самоограничение (бизнес-правило, не меняем).
  if (data.id === admin.id) throw new Error("нельзя менять свою роль");

  const sb = createAdminClient();
  const { error } = await sb
    .from("profiles")
    .update({ is_admin: data.make_admin })
    .eq("id", data.id);
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.id,
    action: "admin_role",
    resource: "profiles",
    resourceId: data.id,
    meta: { make_admin: data.make_admin },
  });

  revalidatePath("/admin/users/" + data.id);
  revalidatePath("/admin/users");
}

const giftSubscriptionSchema = z
  .object({
    user_id: z.string().uuid(),
    months: z.enum(["1", "2", "3", "6"]).transform((v) => Number(v)),
    reason: z.string().min(3).max(300),
    notify: z
      .union([z.literal("true"), z.literal("false"), z.literal("")])
      .transform((v) => v !== "false")
      .optional(),
  })
  .strict();

export async function giftSubscriptionExtension(formData: FormData) {
  await assertSameOrigin();
  const admin = await getAdminUser();
  if (!admin) throw new Error("unauthorized");
  await checkAdminRateLimit(admin.id);
  const data = parseForm(giftSubscriptionSchema, formData);

  const sb = createAdminClient();
  const { data: subs, error: fetchErr } = await sb
    .from("subscriptions")
    .select("id, status, period_end")
    .eq("user_id", data.user_id)
    .order("period_start", { ascending: false })
    .limit(5);
  if (fetchErr) throw new Error(fetchErr.message);

  const now = new Date();
  const active = (subs ?? []).find(
    (s) => s.status === "active" && s.period_end && new Date(String(s.period_end)) >= now
  );
  // База отсчёта: конец активной подписки, иначе — сейчас (подарок запускает подписку).
  const baseMs = active?.period_end
    ? Math.max(new Date(String(active.period_end)).getTime(), now.getTime())
    : now.getTime();
  const newEnd = new Date(baseMs + data.months * 30 * 86400000);

  const patch: Record<string, unknown> = {
    status: "active",
    period_end: newEnd.toISOString(),
    extended_by_admin_reason: data.reason,
    extended_by_admin_id: admin.id,
    extended_by_admin_at: now.toISOString(),
  };
  if (active) {
    const { error } = await sb.from("subscriptions").update(patch).eq("id", active.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from("subscriptions").insert({
      user_id: data.user_id,
      plan: "pro",
      status: "active",
      period_start: now.toISOString(),
      period_end: newEnd.toISOString(),
      auto_renewal: false,
      ...patch,
    });
    if (error) throw new Error(error.message);
  }

  // Уведомление в колокольчик (in-app) — INSERT только service_role.
  await sb.from("notifications").insert({
    user_id: data.user_id,
    type: "subscription_gift",
    title: `Дарим ${data.months} мес. PRO в подарок`,
    body: `${data.reason}. Подписка активна до ${newEnd.toLocaleDateString("ru-RU")}.`,
  });

  // Сервисное письмо (транзакционное, не реклама — отдельное согласие не требуется).
  if (data.notify !== false) {
    try {
      const { sendSubscriptionGiftEmail } = await import("@/lib/mail");
      const { data: prof } = await sb
        .from("profiles")
        .select("full_name")
        .eq("id", data.user_id)
        .single();
      const { data: authUser } = await sb.auth.admin.getUserById(data.user_id);
      const email = authUser?.user?.email;
      if (email) {
        await sendSubscriptionGiftEmail(email, prof?.full_name ?? "", data.months, newEnd, data.reason);
      }
    } catch (e) {
      console.warn("[gift] notify email failed", e);
    }
  }

  await logAdminAction({
    adminId: admin.id,
    action: "subscription_gift_extension",
    resource: "subscriptions",
    resourceId: data.user_id,
    meta: { months: data.months, reason: data.reason, new_period_end: newEnd.toISOString() },
  });

  revalidatePath("/admin/users/" + data.user_id);
  revalidatePath("/admin/users");
  revalidatePath("/admin/subscriptions");
}

export async function updateSubscription(formData: FormData) {
  await assertSameOrigin();
  const admin = await getAdminUser();
  if (!admin) throw new Error("unauthorized");
  await checkAdminRateLimit(admin.id);

  const data = parseForm(updateSubscriptionSchema, formData);

  const sb = createAdminClient();
  const { error } = await sb
    .from("subscriptions")
    .update({
      plan: data.plan,
      status: data.status,
      auto_renewal: data.auto_renewal,
      period_end: data.period_end ? new Date(data.period_end).toISOString() : null,
    })
    .eq("user_id", data.user_id);
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.id,
    action: "profile_update",
    resource: "subscriptions",
    resourceId: data.user_id,
    meta: {
      plan: data.plan,
      status: data.status,
      auto_renewal: data.auto_renewal,
    },
  });

  revalidatePath("/admin/users/" + data.user_id);
  revalidatePath("/admin/users");
  revalidatePath("/admin/subscriptions");
}
