import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initiateRecurringRenewal, type RenewResult } from "@/lib/billing/recurring";

const DAY_MS = 86400000;
// Окно, за которое до истечения подписки мы инициируем автосписание.
const RENEW_WINDOW_DAYS = 3;
// Срок хранения документов в корзине перед безвозвратным удалением.
const TRASH_RETENTION_DAYS = 30;
// Срок хранения записей визитов (rrweb) — поведенческие данные, не дольше 30 дней.
const REPLAY_RETENTION_DAYS = 30;

/**
 * Сравнение CRON_SECRET в constant-time.
 *
 * Прямое строковое сравнение (`auth === \`Bearer ${secret}\``) уязвимо
 * к timing-attack: различимое время отклика на разных байтах позволяет
 * подобрать секрет побайтово (Bernstein-style атака).
 *
 * Используем `crypto.timingSafeEqual` после проверки длин.
 * Длины разных токенов могут различаться — это НЕ утечка секрета
 * (только сам факт "длина не совпала"), но всё равно проверяем
 * токен одинаковой длины для гарантии constant-time.
 */
function authOk(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const provided = auth.slice("Bearer ".length);
  if (provided.length !== secret.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
  } catch {
    return false;
  }
}

interface SubRow {
  id: string;
  user_id: string;
  plan: string | null;
  status: string;
  period_end: string | null;
  auto_renewal: boolean | null;
  yookassa_payment_method_id: string;
}

async function renewSubscriptions(): Promise<{
  processed: number;
  results?: { subscription_id: string; user_id: string; status: RenewResult }[];
  error?: string;
}> {
  const admin = createAdminClient();
  const windowEnd = new Date(Date.now() + RENEW_WINDOW_DAYS * DAY_MS).toISOString();

  const listResult = await admin
    .from("subscriptions")
    .select("id, user_id, plan, status, period_end, auto_renewal, yookassa_payment_method_id")
    .eq("status", "active")
    .eq("auto_renewal", true)
    .not("yookassa_payment_method_id", "is", null)
    .lte("period_end", windowEnd);

  if (listResult.error) return { processed: 0, error: listResult.error.message };
  const subsRaw: unknown = listResult.data;
  const subs = Array.isArray(subsRaw) ? (subsRaw as SubRow[]) : [];
  if (subs.length === 0) return { processed: 0 };

  const results: { subscription_id: string; user_id: string; status: RenewResult }[] = [];
  for (const sub of subs) {
    const status = await initiateRecurringRenewal(admin, {
      id: sub.id,
      user_id: sub.user_id,
      plan: sub.plan ?? "pro",
      yookassa_payment_method_id: sub.yookassa_payment_method_id,
    });
    results.push({ subscription_id: sub.id, user_id: sub.user_id, status });
  }

  return { processed: results.length, results };
}

async function cleanupTrash(): Promise<{ deleted: number; error?: string }> {
  const admin = createAdminClient();
  const cutoffDate = new Date(Date.now() - TRASH_RETENTION_DAYS * DAY_MS).toISOString();

  const { data, error } = await admin
    .from("documents")
    .delete()
    .not("deleted_at", "is", null)
    .lt("deleted_at", cutoffDate)
    .select("id");

  if (error) return { deleted: 0, error: error.message };
  return { deleted: data?.length ?? 0 };
}

/** 152-ФЗ: не хранить поведенческую аналитику дольше необходимого (12 мес). */
async function purgeOldEvents(): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("purge_old_user_events");
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** 152-ФЗ: записи визитов (session replay) храним ограниченно (30 дней). */
async function purgeOldReplays(): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("purge_old_session_replays", { p_days: REPLAY_RETENTION_DAYS });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Ежедневное обслуживание: автосписание подписок + очистка корзины.
 * Объединяет прежние /api/cron/auto-renew и /api/cron/trash-cleanup
 * (лимит Vercel Hobby — 2 cron job).
 * Каждая задача выполняется независимо: сбой одной не мешает другой.
 */
export async function GET(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const renew = await renewSubscriptions();
  const trash = await cleanupTrash();
  const events = await purgeOldEvents();
  const replays = await purgeOldReplays();

  const ok = !renew.error && !trash.error && events.ok && replays.ok;
  return NextResponse.json(
    { ok, renew: { processed: renew.processed, results: renew.results, error: renew.error }, trash, events, replays },
    { status: ok ? 200 : 500 },
  );
}
