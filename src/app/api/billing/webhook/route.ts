import crypto from "node:crypto";
import { NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { collectReport } from "@/lib/tronk";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { yookassaWebhookSchema, validateBody } from "@/lib/validations/api";
import { logUserEvent, SERVER_SESSION_PREFIX } from "@/lib/userEvents";
import { sendEmail, sendTelegram, SUPPORT_EMAIL } from "@/lib/mail";
import { creditForTopup } from "@/lib/ai/pricing";

const EPTS_PRICE = 800;

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Увеличенный таймаут для этого роута — collectReport может выполняться
// до ~45 секунд. Генерация отчёта вынесена в after(): ответ ЮKassa
// отправляется немедленно, а сборка отчёта продолжается в фоне в рамках
// этого же инвокейшена (maxDuration).
export const maxDuration = 60;

const DAY_MS = 86400000;

interface PaymentRow {
  id: string;
  user_id: string;
  status: string;
  amount: string | number | null;
  currency: string | null;
  meta: Record<string, unknown> | null;
}

interface EptsLeadRow {
  id: string;
  status: string;
  vin: string | null;
  phone: string | null;
  meta: Record<string, unknown> | null;
}

// Заголовок, в котором ЮKassa передаёт HMAC-SHA256 подпись (hex) для
// входящего уведомления. Формат подписи согласовывается при подключении
// магазина в личном кабинете ЮKassa (раздел "Интеграция" → "HTTP-уведомления"
// → "Подпись уведомлений"). На момент внедрения публичной
// кросс-версионной спецификации формата у ЮKassa нет, поэтому реализован
// гибкий парсер: если в значении заголовка есть префикс "sha256=" —
// снимаем его, оставшееся трактуем как hex-digest HMAC от raw body.
//
// Если формат подписи в ЮKassa изменится — поменяйте ТОЛЬКО тело
// verifyYooKassaSignature (одна функция). Контракт вызова и порядок
// проверок в POST остаются прежними.
const SIGNATURE_HEADER = "x-yookassa-signature";
const SIGNATURE_HEADER_ALT = "yookassa-signature";
const SIGNATURE_HEX_PREFIX = "sha256=";

// Официальный список IP-адресов ЮKassa для входящих уведомлений:
// https://yookassa.ru/developers/using-api/webhooks
// Доп. подсети можно добавить через env YOOKASSA_IP_ALLOWLIST (через запятую).
const YOOKASSA_NETS: string[] = [
  "185.71.76.0/27",
  "185.71.77.0/27",
  "77.75.153.0/25",
  "77.75.154.128/25",
  "77.75.156.11",
  "77.75.156.35",
  "2a02:5180::/32",
];

/**
 * Проверяет HMAC-подпись webhook ЮKassa.
 *
 * Контракт:
 * - secret читается из env `YOOKASSA_NOTIFICATION_SECRET` (владелец
 *   задаёт в Vercel, получив ключ в ЛК ЮKassa).
 * - payload — это raw body HTTP-запроса в кодировке UTF-8 (важно:
 *   подпись считается ДО JSON.parse, иначе форматирование может
 *   измениться и подпись не сойдётся).
 * - возвращаемый signature — hex (или base64 — оба варианта принимаем).
 *
 * Возвращает false, если:
 * - secret не задан в окружении (fail-closed: всякие подписи отвергаются);
 * - заголовок подписи отсутствует;
 * - подпись не совпадает (сравнение в constant-time);
 * - длина не совпадает (также constant-time).
 */
function verifyYooKassaSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const secret = process.env.YOOKASSA_NOTIFICATION_SECRET;
  if (!secret) return false;
  if (!signatureHeader) return false;

  // Поддерживаем оба формата, которые исторически встречались в ЛК:
  //   "abc123..." (hex)
  //   "sha256=abc123..." (с префиксом алгоритма)
  let provided = signatureHeader.trim();
  if (provided.toLowerCase().startsWith(SIGNATURE_HEX_PREFIX)) {
    provided = provided.slice(SIGNATURE_HEX_PREFIX.length);
  }

  // Считаем HMAC-SHA256 от raw body. Сравниваем только в hex-формате —
  // это самый распространённый вариант, и hex однозначно детерминирован
  // по длине (64 символа для SHA-256).
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  if (expected.length !== provided.length) {
    // Возвращаем false, но всё равно выполняем timingSafeEqual на буферах
    // одинаковой длины, чтобы не давать различимый тайминг по длине
    // (для атакующего это не критично, но гигиена важна).
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(expected));
    return false;
  }
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(provided, "utf8"),
    );
  } catch {
    return false;
  }
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map(Number);
  if (octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) return null;
  return octets.reduce((acc, o) => acc * 256 + o, 0) >>> 0;
}

function ipInCidr(ip: string, cidr: string): boolean {
  if (cidr.includes(":")) {
    return ip.startsWith("2a02:5180") && cidr === "2a02:5180::/32";
  }
  const [range, prefixRaw] = cidr.split("/");
  const addr = ipv4ToInt(ip);
  if (addr === null) return false;
  const prefix = prefixRaw ? Number(prefixRaw) : 32;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const net = ipv4ToInt(range) ?? 0;
  return (addr & mask) === (net & mask);
}

function isYooKassaIp(ip: string | null): boolean {
  if (!ip) return false;
  const extra = (process.env.YOOKASSA_IP_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const nets = [...YOOKASSA_NETS, ...extra];
  return nets.some((n) => ipInCidr(ip, n));
}

function clientIp(req: Request): string | null {
  // На Vercel x-vercel-forwarded-for задаётся инфраструктурой и не может быть подделан клиентом
  const vff = req.headers.get("x-vercel-forwarded-for");
  if (vff) return vff.split(",")[0].trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}

// Верификация платежа на стороне ЮKassa: подлинное уведомление можно
// проверить запросом к API (статус объекта актуален на момент запроса).
async function verifyPayment(
  providerId: string,
  expectedAmount: number,
  expectedCurrency: string
): Promise<{ ok: true; status: string } | { ok: false; reason: string }> {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) return { ok: false, reason: "no_credentials" };

  try {
    const res = await fetch(
      `https://api.yookassa.ru/v3/payments/${encodeURIComponent(providerId)}`,
      { headers: { Authorization: "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64") } }
    );
    if (res.status === 404) return { ok: false, reason: "payment_not_found" };
    if (!res.ok) return { ok: false, reason: "provider_error" };

    const payment = (await res.json()) as {
      amount?: { value?: string | number; currency?: string };
      status?: string;
    };
    const amount = payment.amount;
    if (!amount) return { ok: false, reason: "no_amount" };
    if (Number(amount.value) !== expectedAmount || amount.currency !== expectedCurrency) {
      return { ok: false, reason: "amount_mismatch" };
    }
    if (typeof payment.status !== "string") return { ok: false, reason: "no_status" };
    return { ok: true, status: payment.status };
  } catch {
    return { ok: false, reason: "provider_unreachable" };
  }
}

// Причины сбоя verifyPayment, при которых повторная доставка уведомления
// может помочь: сетевые/временные сбои API ЮKassa или отложенная
// согласованность (payment_not_found сразу после создания платежа).
const RETRYABLE_VERIFY_REASONS = new Set([
  "payment_not_found",
  "provider_error",
  "provider_unreachable",
  "no_credentials",
]);

// Ранее при любом сбое verifyPayment возвращался 200 ({ok:true}) — ЮKassa
// считала уведомление доставленным и НЕ повторяла его, из-за чего платёж
// мог навсегда остаться необработанным (деньги списаны, услуга не выдана).
// Теперь временные сбои → 5xx (ЮKassa повторит доставку), а недостоверные
// уведомления (несовпадение суммы/валюты и т.п.) → 200, т.к. повтор не поможет.
function verifyFailureResponse(reason: string, kind: string, providerId: string) {
  if (RETRYABLE_VERIFY_REASONS.has(reason)) {
    console.error(
      `[billing/webhook] verifyPayment(${kind}) transient failure: ${reason} (payment ${providerId}) — asking YooKassa to retry`,
    );
    return NextResponse.json(
      { ok: false, error: "verification_unavailable", reason },
      { status: 500, headers: { "Retry-After": "60" } },
    );
  }
  console.error(
    `[billing/webhook] verifyPayment(${kind}) rejected: ${reason} (payment ${providerId}) — notification not processed`,
  );
  return NextResponse.json({ ok: true, rejected: reason });
}

export async function POST(req: Request) {
  // Fail-closed: если ЮKassa не настроена, вебхук полностью отключён.
  if (!process.env.YOOKASSA_SECRET_KEY) {
    return NextResponse.json({ error: "disabled" }, { status: 401 });
  }
  // Fail-closed: подпись обязательна. Без YOOKASSA_NOTIFICATION_SECRET
  // эндпоинт не принимает ни одного уведомления — владелец должен
  // либо включить «Подпись уведомлений» в ЛК ЮKassa и положить
  // секрет в env, либо отключить webhook, чтобы избежать ложных
  // срабатываний.
  if (!process.env.YOOKASSA_NOTIFICATION_SECRET) {
    return NextResponse.json({ error: "disabled" }, { status: 401 });
  }

  // 1. HMAC-проверка подписи (ПЕРВЫЙ фактор). Читаем raw body и заголовок
  // ДО любых преобразований — подпись считается от точных байт,
  // которые прислал ЮKassa. До JSON.parse.
  const rawBody = await req.text();
  if (!rawBody) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const sig =
    req.headers.get(SIGNATURE_HEADER) ?? req.headers.get(SIGNATURE_HEADER_ALT);
  if (!verifyYooKassaSignature(rawBody, sig)) {
    // 401 (не 200 и не 403), чтобы ЮKassa повторила доставку —
    // но владелец должен увидеть 401 в логах и проверить секрет.
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  // 2. Источник уведомления — только IP ЮKassa (второй фактор).
  // Если IP не из списка, но подпись валидна — это атака через
  // компрометацию сети ЮKassa, и мы блокируем обработку.
  const ip = clientIp(req);
  if (!isYooKassaIp(ip)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rl = await checkRateLimit(limiters.webhook, ip ?? "webhook");
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  // 3. Только теперь парсим JSON и валидируем структуру.
  let rawJson: unknown;
  try {
    rawJson = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateBody(yookassaWebhookSchema, rawJson);
  if (!validation.success) {
    return validation.error;
  }

  const body = validation.data;
  const event = body.event;
  const payment = body.object;
  if (!payment?.id) return NextResponse.json({ ok: true });

  const admin = createAdminClient();

  // ЭПТС-заказ: публичный флоу без аккаунта — заявку ищем по
  // leads.meta->>provider_id (строка в payments не создаётся, т.к. тестовая
  // таблица требует user_id, а у заказа ЭПТС пользователя нет).
  const eptsLeadResult = await admin
    .from("leads")
    .select("id, status, vin, phone, meta")
    .eq("service", "epts")
    .filter("meta->>provider_id", "eq", payment.id)
    .limit(1);
  const rawEpts: unknown = eptsLeadResult.data;
  const eptsLead = (rawEpts as EptsLeadRow[] | null)?.[0];

  if (eptsLead) {
    if (event === "payment.canceled" || event === "payment.refund.succeeded") {
      if (eptsLead.status !== "paid") {
        await admin.from("leads").update({ status: "payment_canceled" }).eq("id", eptsLead.id);
      }
      return NextResponse.json({ ok: true });
    }

    if (event !== "payment.succeeded") return NextResponse.json({ ok: true });
    if (eptsLead.status === "paid") return NextResponse.json({ ok: true }); // идемпотентность

    const meta = eptsLead.meta ?? {};
    const amount = Number(meta.amount ?? EPTS_PRICE);
    const verified = await verifyPayment(payment.id, amount, "RUB");
    if (!verified.ok) return verifyFailureResponse(verified.reason, "epts", payment.id);
    if (verified.status !== "succeeded") return NextResponse.json({ ok: true });

    const updResult = await admin
      .from("leads")
      .update({ status: "paid", meta: { ...meta, paid_at: new Date().toISOString(), provider_status: "paid" } })
      .eq("id", eptsLead.id)
      .neq("status", "paid")
      .select("id");
    if (!updResult.data || updResult.data.length === 0) {
      return NextResponse.json({ ok: true, skipped: "already processed concurrently" });
    }

    const email = typeof meta.email === "string" ? meta.email : "";
    const eptsNumber = typeof meta.epts === "string" ? meta.epts : "";
    const text = `Оплачена заявка: выписка ЭПТС\nVIN: ${eptsLead.vin ?? ""}\n№ ЭПТС: ${eptsNumber}\nEmail: ${email}\nТелефон: ${eptsLead.phone ?? ""}\nСумма: ${amount} ₽`;
    await sendTelegram("💰 " + text);
    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: "Оплата: выписка ЭПТС",
      html: `<div style="font-family:Arial,sans-serif;padding:16px;white-space:pre-wrap;color:#374151;">${escapeHtml(text)}</div>`,
    });
    return NextResponse.json({ ok: true });
  }

  const rowsResult = await admin
    .from("payments")
    .select("id, user_id, status, amount, currency, meta")
    .eq("provider_id", payment.id)
    .limit(1);

  const rawRows: unknown = rowsResult.data;
  const rows = rawRows as PaymentRow[] | null;
  if (!rows || rows.length === 0) return NextResponse.json({ ok: true });
  const row = rows[0];
  const paymentMethodId = payment.payment_method?.id ?? null;

  // Возврат/отмена: для ai_topup обязательно списываем зачисленное,
  // иначе abuse — «пополнил → потратил → вернул через банк → баланс остался».
  // Идемпотентность — по записи topup_refund в леджере.
  if (event === "payment.canceled" || event === "payment.refund.succeeded") {
    if (row.status !== "paid") {
      await admin.from("payments").update({ status: "canceled" }).eq("id", row.id);
    } else if ((row.meta as { purpose?: unknown } | null)?.purpose === "ai_topup") {
      const refunded = await admin
        .from("ai_ledger")
        .select("id")
        .eq("user_id", row.user_id)
        .eq("reason", "topup_refund")
        .filter("meta->>payment_id", "eq", payment.id)
        .limit(1);
      const already = refunded.data ?? [];
      if (already.length === 0) {
        const topups = await admin
          .from("ai_ledger")
          .select("delta_kopeks")
          .eq("user_id", row.user_id)
          .in("reason", ["topup", "topup_bonus"])
          .filter("meta->>payment_id", "eq", payment.id);
        const credited = (topups.data ?? [])
          .reduce((sum: number, r: { delta_kopeks: number }) => sum + r.delta_kopeks, 0);
        if (credited > 0) {
          const balRes = await admin
            .from("ai_balances")
            .select("balance_kopeks")
            .eq("user_id", row.user_id)
            .limit(1)
            .maybeSingle();
          const current = Number((balRes.data as { balance_kopeks?: unknown } | null)?.balance_kopeks ?? 0);
          const deduct = Math.min(current, credited);
          await admin.from("ai_balances").update({ balance_kopeks: current - deduct, updated_at: new Date().toISOString() }).eq("user_id", row.user_id);
          await admin.from("ai_ledger").insert({
            user_id: row.user_id,
            delta_kopeks: -deduct,
            reason: "topup_refund",
            meta: { payment_id: payment.id },
          });
        }
      }
    }
    return NextResponse.json({ ok: true });
  }

  if (event !== "payment.succeeded") return NextResponse.json({ ok: true });
  if (row.status === "paid") return NextResponse.json({ ok: true }); // идемпотентность

  // 2. Подтверждаем платёж на стороне ЮKassa (API) и сверяем сумму.
  const verified = await verifyPayment(
    payment.id,
    Number(row.amount ?? 0),
    row.currency ?? "RUB"
  );
  if (!verified.ok) return verifyFailureResponse(verified.reason, "payment", payment.id);
  const paid = verified.status === "succeeded";

  const { data: updatedRows } = await admin
    .from("payments")
    .update({ status: paid ? "paid" : "failed" })
    .eq("id", row.id)
    .neq("status", "paid")
    .select("id");

  // Если ни одна строка не обновилась — значит другой параллельный вебхук
  // уже успел пометить платёж как "paid" первым. Прерываем обработку,
  // чтобы не продлевать подписку дважды.
  if (paid && (!updatedRows || updatedRows.length === 0)) {
    return NextResponse.json({ ok: true, skipped: "already processed concurrently" });
  }

  if (paid) {
    const meta = row.meta ?? {};
    const now = new Date();

    // Журнал аналитики: успех оплаты пишет СЕРВЕР (вебхук уже прошёл
    // идемпотентную проверку row.status !== 'paid' выше). Так событие не
    // теряется, если пользователь закрыл вкладку до /billing?success=1.
    await logUserEvent({
      event: "payment_success",
      userId: row.user_id,
      sessionId: `${SERVER_SESSION_PREFIX}${payment.id}`,
      meta: { plan: typeof meta.plan === "string" ? meta.plan : undefined },
    });

    // AI-баланс: пополнение кошелька (meta.purpose === "ai_topup" из /api/ai/topup).
    // Идемпотентность — та же, что у подписок: повторный вебхук по уже
    // оплаченному платежу отбрасывается проверкой row.status выше.
    if (meta.purpose === "ai_topup") {
      const amountRub = Math.floor(Number(meta.amount_rub ?? row.amount ?? 0));
      if (amountRub > 0) {
        const { creditKopeks, bonusKopeks } = creditForTopup(amountRub);
        const balRes = await admin
          .from("ai_balances")
          .select("balance_kopeks")
          .eq("user_id", row.user_id)
          .limit(1)
          .maybeSingle();
        const current = Number((balRes.data as { balance_kopeks?: unknown } | null)?.balance_kopeks ?? 0);
        if (!balRes.data) {
          await admin.from("ai_balances").insert({ user_id: row.user_id, balance_kopeks: creditKopeks, free_asked: 0 });
        } else {
          await admin.from("ai_balances").update({ balance_kopeks: current + creditKopeks, updated_at: new Date().toISOString() }).eq("user_id", row.user_id);
        }
        await admin.from("ai_ledger").insert([
          {
            user_id: row.user_id,
            delta_kopeks: amountRub * 100,
            reason: "topup",
            meta: { payment_id: payment.id, amount_rub: amountRub },
          },
          ...(bonusKopeks > 0
            ? [{
                user_id: row.user_id,
                delta_kopeks: bonusKopeks,
                reason: "topup_bonus",
                meta: { payment_id: payment.id, amount_rub: amountRub },
              }]
            : []),
        ]);
        await logUserEvent({
          event: "ai_topup_success",
          userId: row.user_id,
          sessionId: `${SERVER_SESSION_PREFIX}${payment.id}`,
          meta: { amount_rub: amountRub },
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (meta.type === "report" && typeof meta.vin === "string") {      const vin = meta.vin.toUpperCase();
      // Сборка отчёта может занимать до ~45с — выносим в after(), чтобы
      // ответить ЮKassa немедленно (иначе webhook рискует таймаутом и
      // повторной доставкой). Идемпотентность платежа обеспечена выше.
      after(async () => {
        const dupResult = await admin
          .from("reports")
          .select("payload")
          .eq("vin", vin)
          .eq("status", "ready")
          .not("payload", "is", null)
          .limit(1);
        const rawDup: unknown = dupResult.data;
        const dup = rawDup as Array<{ payload: Record<string, unknown> | null }> | null;

        let payload: Record<string, unknown> | null = null;
        if (dup && dup.length > 0 && dup[0].payload && Object.keys(dup[0].payload).length > 0) {
          payload = dup[0].payload;
        } else {
          try {
            payload = (await collectReport(vin, meta.premium === true)).sources;
          } catch {
            payload = null;
          }
        }

        if (payload && payload.error) {
          // Источник недоступен (нет доступа / баланс / сбой генерации).
          await admin
            .from("reports")
            .update({ status: "failed", payload: { error: "provider_unavailable" } })
            .eq("user_id", row.user_id)
            .eq("vin", vin);
        } else if (payload && payload.tronk_task_id) {
          // Генерация ещё идёт — оставляем pending, финал доведёт /api/autoteka/check.
          await admin
            .from("reports")
            .update({ status: "pending", payload })
            .eq("user_id", row.user_id)
            .eq("vin", vin);
        } else if (payload && Object.keys(payload).length > 0) {
          await admin
            .from("reports")
            .update({ status: "ready", payload })
            .eq("user_id", row.user_id)
            .eq("vin", vin);
        } else {
          await admin
            .from("reports")
            .update({ status: "failed", payload: { error: "provider_unavailable" } })
            .eq("user_id", row.user_id)
            .eq("vin", vin);
        }
      });
      return NextResponse.json({ ok: true });
    }

    const plan = meta.plan ?? "pro";

    // Если подписка с автопродлением ещё активна — продлеваем период,
    // иначе проверяем, есть ли уже активная подписка (предотвращаем дубликаты).
    const { data: subs } = await admin
      .from("subscriptions")
      .select("id, period_end, auto_renewal, yookassa_payment_method_id")
      .eq("user_id", row.user_id)
      .eq("status", "active")
      .order("period_end", { ascending: false })
      .limit(1);

    const activeSub = (subs ?? []).find(
      (s) => s.period_end && new Date(String(s.period_end)) > now
    );

    if (activeSub) {
      // Активная подписка есть — продлеваем её период на 30 дней.
      // Поведение одинаково и с auto_renewal, и без: платёж уже произошёл
      // (успешный вебхук), поэтому обе ветки раньше делали одно и то же —
      // объединены в одну для честности кода.
      const base = new Date(String(activeSub.period_end));
      const extended = new Date(base.getTime() + 30 * DAY_MS);
      await admin
        .from("subscriptions")
        .update({
          period_end: extended.toISOString(),
          yookassa_payment_method_id: paymentMethodId ?? activeSub.yookassa_payment_method_id,
        })
        .eq("id", activeSub.id);
    } else {
      // Нет активных подписок — создаём новую
      const end = new Date(now.getTime() + 30 * DAY_MS);
      await admin.from("subscriptions").insert({
        user_id: row.user_id,
        plan,
        status: "active",
        period_start: now.toISOString(),
        period_end: end.toISOString(),
        yookassa_payment_method_id: paymentMethodId,
        auto_renewal: false,
      });
    }
  }

  return NextResponse.json({ ok: true });
}