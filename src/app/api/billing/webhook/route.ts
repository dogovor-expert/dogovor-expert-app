import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { collectReport } from "@/lib/apipoint";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

const DAY_MS = 86400000;

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

    const payment = await res.json();
    const amount = payment.amount;
    if (!amount) return { ok: false, reason: "no_amount" };
    if (Number(amount.value) !== expectedAmount || amount.currency !== expectedCurrency) {
      return { ok: false, reason: "amount_mismatch" };
    }
    return { ok: true, status: payment.status };
  } catch {
    return { ok: false, reason: "provider_unreachable" };
  }
}

export async function POST(req: Request) {
  if (!process.env.YOOKASSA_SECRET_KEY) {
    return NextResponse.json({ error: "disabled" }, { status: 401 });
  }

  // 1. Источник уведомления — только IP ЮKassa.
  if (!isYooKassaIp(clientIp(req))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rl = await checkRateLimit(limiters.webhook, clientIp(req) ?? "webhook");
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  const event = body?.event;
  const payment = body?.object;
  if (!payment?.id) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("payments")
    .select("id, user_id, status, amount, currency, meta")
    .eq("provider_id", payment.id)
    .limit(1);

  if (!rows || rows.length === 0) return NextResponse.json({ ok: true });
  const row = rows[0];
  const paymentMethodId = payment.payment_method?.id ?? null;

  if (event === "payment.canceled" || event === "payment.refund.succeeded") {
    if (row.status !== "paid") {
      await admin.from("payments").update({ status: "canceled" }).eq("id", row.id);
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
  if (!verified.ok) return NextResponse.json({ ok: true });
  const paid = verified.status === "succeeded";

  await admin.from("payments").update({ status: paid ? "paid" : "failed" }).eq("id", row.id);

  if (paid) {
    const meta = row.meta ?? {};
    const now = new Date();

    if (meta.type === "report" && typeof meta.vin === "string") {
      const vin = meta.vin.toUpperCase();
      const { data: dup } = await admin
        .from("reports")
        .select("payload")
        .eq("vin", vin)
        .eq("status", "ready")
        .not("payload", "is", null)
        .limit(1);

      let payload: Record<string, unknown> | null = null;
      if (dup && dup.length > 0 && dup[0].payload && Object.keys(dup[0].payload).length > 0) {
        payload = dup[0].payload;
      } else {
        try {
          payload = (await collectReport(vin)).sources;
        } catch {
          payload = null;
        }
      }

      if (payload) {
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
      return NextResponse.json({ ok: true });
    }

    const plan = meta.plan ?? "pro";

    // Если подписка с автопродлением ещё активна — продлеваем период,
    // иначе создаём новую запись (обычная оплата).
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

    if (activeSub && activeSub.auto_renewal) {
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