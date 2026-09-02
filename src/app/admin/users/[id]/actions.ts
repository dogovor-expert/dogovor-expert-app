"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";

const formStr = (fd: FormData, key: string): string => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

export async function updateProfile(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("unauthorized");

  const id = formStr(formData, "id");
  if (!id) throw new Error("missing id");

  const full_name = formStr(formData, "full_name").trim();
  const company = formStr(formData, "company").trim();
  const inn = formStr(formData, "inn").trim();
  const phone = formStr(formData, "phone").trim();

  const sb = createAdminClient();
  const { error } = await sb
    .from("profiles")
    .update({ full_name, company, inn, phone })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.id,
    action: "profile_update",
    resource: "profiles",
    resourceId: id,
    meta: { full_name, company, inn },
  });

  revalidatePath("/admin/users/" + id);
  revalidatePath("/admin/users");
}

export async function toggleAdminUser(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("unauthorized");

  const id = formStr(formData, "id");
  const makeAdmin = formData.get("make_admin") === "true";
  if (!id) throw new Error("missing id");
  if (id === admin.id) throw new Error("нельзя менять свою роль");

  const sb = createAdminClient();
  const { error } = await sb.from("profiles").update({ is_admin: makeAdmin }).eq("id", id);
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.id,
    action: "admin_role",
    resource: "profiles",
    resourceId: id,
    meta: { make_admin: makeAdmin },
  });

  revalidatePath("/admin/users/" + id);
  revalidatePath("/admin/users");
}

export async function updateSubscription(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("unauthorized");

  const userId = formStr(formData, "user_id");
  const plan = formStr(formData, "plan").trim();
  const status = formStr(formData, "status").trim();
  const autoRenewal = formData.get("auto_renewal") === "true";
  const periodEnd = formStr(formData, "period_end").trim();

  if (!userId) throw new Error("missing user_id");

  const sb = createAdminClient();
  const { error } = await sb
    .from("subscriptions")
    .update({
      plan,
      status,
      auto_renewal: autoRenewal,
      period_end: periodEnd ? new Date(periodEnd).toISOString() : null,
    })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminId: admin.id,
    action: "profile_update",
    resource: "subscriptions",
    resourceId: userId,
    meta: { plan, status, auto_renewal: autoRenewal },
  });

  revalidatePath("/admin/users/" + userId);
  revalidatePath("/admin/users");
  revalidatePath("/admin/subscriptions");
}
