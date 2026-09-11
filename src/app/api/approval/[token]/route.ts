import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { isSameOrigin } from "@/lib/admin-auth";
import { withCsrf } from "@/lib/csrf";
import { verifyPassword, hashToken } from "@/lib/crypto.server";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";

const UNLOCK_SESSION_MS = 60 * 60 * 1000; // 1 час — сессия доступа после ввода пароля

interface ClientProjection {
  id: string;
  token: string;
  template_id: string;
  values: Record<string, string>;
  checklist: Record<string, boolean>;
  changed: boolean;
  expires_at: string;
  opened_count: number;
  password_hash: string | null;
}

/** Проверка действующей unlock-сессии: подходит ли переданный access-токен. */
async function hasValidAccess(
  admin: ReturnType<typeof createAdminClient>,
  approval: ClientProjection,
  accessToken: string | null
): Promise<boolean> {
  if (!approval.password_hash) return true; // ссылка без пароля — открыта всегда
  if (!accessToken) return false;
  const tokenHash = hashToken(accessToken);
  const { data, error } = await admin
    .from("approval_unlocks")
    .select("expires_at")
    .eq("approval_id", approval.id)
    .eq("token_hash", tokenHash)
    .limit(1)
    .maybeSingle();
  if (error || !data) return false;
  return new Date(data.expires_at).getTime() > Date.now();
}

/** Публичный срез для клиента — ПДн отдаём только после разблокировки. */
function publicSlice(approval: ClientProjection, unlocked: boolean) {
  if (!unlocked) {
    return {
      locked: true,
      requiresPassword: Boolean(approval.password_hash),
      templateId: approval.template_id,
      expiresAt: approval.expires_at,
    };
  }
  return {
    locked: false,
    templateId: approval.template_id,
    values: approval.values,
    checklist: approval.checklist,
    changed: approval.changed,
    expiresAt: approval.expires_at,
  };
}

async function writeAccessLog(
  admin: ReturnType<typeof createAdminClient>,
  approvalId: string,
  action: "view" | "unlock" | "edit" | "unlock_failed",
  req: Request
) {
  const ip = clientIp(req);
  const ua = req.headers.get("user-agent");
  await admin.from("approval_access_log").insert({
    approval_id: approvalId,
    action,
    ip,
    user_agent: ua,
  });
}

async function loadApproval(
  admin: ReturnType<typeof createAdminClient>,
  token: string
): Promise<{
  approval: ClientProjection | null;
  notFound: boolean;
}> {
  const { data, error } = await admin
    .from("approvals")
    .select("id, token, template_id, values, checklist, changed, expires_at, opened_count, password_hash, mode")
    .eq("token", token)
    .single();

  if (error || !data) return { approval: null, notFound: true };
  return { approval: data as ClientProjection, notFound: false };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const rl = await checkRateLimit(limiters.publicForm, clientIp(req) + ":" + token);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const admin = createAdminClient();
  const { approval, notFound } = await loadApproval(admin, token);
  if (notFound || !approval) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (new Date(approval.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  const accessToken = new URL(req.url).searchParams.get("access");
  const unlocked = await hasValidAccess(admin, approval, accessToken);

  // Считаем открытие только при разблокированной ссылке (?view=1).
  const isView = new URL(req.url).searchParams.get("view") === "1";
  if (unlocked && isView) {
    const { error: countErr } = await admin
      .from("approvals")
      .update({ opened_count: Number(approval.opened_count ?? 0) + 1 })
      .eq("id", approval.id);
    if (!countErr) await writeAccessLog(admin, approval.id, "view", req);
  }

  return NextResponse.json(publicSlice(approval, unlocked));
}

/** Разблокировка: контрагент вводит пароль → получает access-токен и данные. */
async function unlockHandler(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { token } = await params;
  const rl = await checkRateLimit(limiters.authAction, clientIp(req) + ":" + token);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length === 0 || password.length > 64) {
    return NextResponse.json({ error: "password required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { approval, notFound } = await loadApproval(admin, token);
  if (notFound || !approval) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (new Date(approval.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }
  if (!approval.password_hash) {
    return NextResponse.json({ error: "no password required" }, { status: 400 });
  }

  if (!verifyPassword(password, approval.password_hash)) {
    await writeAccessLog(admin, approval.id, "unlock_failed", req);
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }

  // Создаём unlock-сессию (случайный токен, SHA-256 в БД)
  const accessToken = randomUUID();
  const expiresAt = new Date(Date.now() + UNLOCK_SESSION_MS);
  await admin.from("approval_unlocks").insert({
    approval_id: approval.id,
    token_hash: hashToken(accessToken),
    ip: clientIp(req),
    expires_at: expiresAt.toISOString(),
  });

  // Увеличиваем счётчик открытий + аудит
  await admin
    .from("approvals")
    .update({ opened_count: Number(approval.opened_count ?? 0) + 1 })
    .eq("id", approval.id);
  await writeAccessLog(admin, approval.id, "unlock", req);
  await writeAccessLog(admin, approval.id, "view", req);

  return NextResponse.json({
    ...publicSlice(approval, true),
    accessToken,
    accessExpiresAt: expiresAt.toISOString(),
  });
}

export const POST = withCsrf(unlockHandler);

/**
 * Валидация values на основе определённого шаблона.
 * Поле должно существовать в template.fields, иначе — отклоняем (защита от инъекций полей).
 */
function validateValuesAgainstTemplate(
  templateId: string,
  values: Record<string, string>,
  checklist: Record<string, boolean>
): { ok: boolean; error?: string } {
  const template = LEGAL_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return { ok: false, error: "template not found" };

  const unknown = Object.keys(values).filter(
    (k) => !template.fields.some((f) => f.id === k)
  );
  if (unknown.length > 0) {
    return { ok: false, error: `unknown fields: ${unknown.join(", ")}` };
  }

  for (const field of template.fields) {
    const value = values[field.id];

    if (field.validation?.required && (!value || String(value).trim() === "")) {
      return { ok: false, error: `field "${field.id}" is required` };
    }
    if (value === undefined) continue;

    const raw = String(value);
    if (field.type === "select" || field.type === "radio") {
      if (raw === "") continue;
      const allowed = (field.options ?? []).map((o) =>
        typeof o === "string" ? o : o.value
      );
      if (allowed.length > 0 && !allowed.includes(raw)) {
        return { ok: false, error: `field "${field.id}" has invalid option` };
      }
    }
    if (field.type === "checkbox") {
      if (raw !== "true" && raw !== "false") {
        return { ok: false, error: `field "${field.id}" must be true/false` };
      }
    }
    if (field.type === "date") {
      if (raw !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return { ok: false, error: `field "${field.id}" must be a date` };
      }
    }
    if (field.validation?.pattern && raw !== "" && !new RegExp(field.validation.pattern).test(raw)) {
      return { ok: false, error: `field "${field.id}" does not match pattern` };
    }
    if (field.validation?.maxLength && raw.length > field.validation.maxLength) {
      return { ok: false, error: `field "${field.id}" exceeds max length` };
    }
  }

  // Checklist: только boolean-значения, ключи — строки не длиннее 200 символов
  const MAX_CHECKLIST_KEYS = 300;
  if (Object.keys(checklist).length > MAX_CHECKLIST_KEYS) {
    return { ok: false, error: "checklist too large" };
  }
  for (const [k, v] of Object.entries(checklist)) {
    if (typeof k !== "string" || k.length > 200 || typeof v !== "boolean") {
      return { ok: false, error: "invalid checklist entry" };
    }
  }

  return { ok: true };
}

async function putHandler(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { token } = await params;
  const rl = await checkRateLimit(limiters.publicForm, clientIp(req) + ":" + token);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }
  const values = body.values && typeof body.values === "object" ? body.values : {};
  const checklist = body.checklist && typeof body.checklist === "object" ? body.checklist : {};

  const admin = createAdminClient();
  const { approval, notFound } = await loadApproval(admin, token);
  if (notFound || !approval) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (new Date(approval.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  // Парольная ссылка: PUT возможен только с действующим access-токеном
  const accessToken = typeof body.accessToken === "string" ? body.accessToken : null;
  if (!(await hasValidAccess(admin, approval, accessToken))) {
    return NextResponse.json({ error: "locked: access token required" }, { status: 403 });
  }

  const validated = validateValuesAgainstTemplate(approval.template_id, values, checklist);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { error } = await admin
    .from("approvals")
    .update({
      values,
      checklist,
      changed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", approval.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAccessLog(admin, approval.id, "edit", req);
  return NextResponse.json({ ok: true });
}

export const PUT = withCsrf(putHandler);

/** Владелец применил правки контрагента — сбрасываем флаг changed. */
async function patchHandler(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: existing, error: findError } = await admin
    .from("approvals")
    .select("id, user_id")
    .eq("token", token)
    .single();
  if (findError || !existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (existing.user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { error } = await admin
    .from("approvals")
    .update({ changed: false, updated_at: new Date().toISOString() })
    .eq("id", existing.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export const PATCH = withCsrf(patchHandler);