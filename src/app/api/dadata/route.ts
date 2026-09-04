import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit, rateLimitResponse, clientIp } from "@/lib/ratelimit";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";

const DADATA_HOST = "https://suggestions.dadata.ru/suggestions/api/4_1/rs";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 часа для findById/party
const partyCache = new Map<string, { ts: number; body: unknown }>();

async function hasActiveSubscription(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("status, period_end")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  const now = new Date();
  return (subs ?? []).some(
    (s) =>
      s.status === "active" &&
      s.period_end &&
      new Date(String(s.period_end)) >= now
  );
}

interface DadataSuggestion {
  value?: unknown;
  data?: {
    // Party fields
    inn?: unknown;
    kpp?: unknown;
    ogrn?: unknown;
    type?: unknown;
    okved?: unknown;
    state?: { status?: unknown };
    name?: { short_with_opf?: unknown; full_with_opf?: unknown } | string;
    address?: { value?: unknown; unrestricted_value?: unknown };
    management?: { name?: unknown; post?: unknown };
    code?: unknown;
    region_code?: unknown;
    // FIO fields
    surname?: unknown;
    patronymic?: unknown;
    gender?: unknown;
    birthdate?: unknown;
    passport_series?: unknown;
    passport_number?: unknown;
    passport_issue_date?: unknown;
    passport_issued_by?: unknown;
    passport_code?: unknown;
    snils?: unknown;
  };
}

function sanitizeParty(data: DadataSuggestion): Record<string, unknown> {
  const nameObj = data.data?.name;
  const isNameObj = typeof nameObj === "object" && nameObj !== null;
  return {
    value: String(data.value ?? ""),
    inn: String(data.data?.inn ?? ""),
    kpp: String(data.data?.kpp ?? ""),
    ogrn: String(data.data?.ogrn ?? ""),
    type: String(data.data?.type ?? ""),
    status: String(data.data?.state?.status ?? ""),
    name_short_with_opf: String((isNameObj ? nameObj.short_with_opf : undefined) ?? ""),
    name_full_with_opf: String((isNameObj ? nameObj.full_with_opf : undefined) ?? ""),
    address_value: String(data.data?.address?.value ?? ""),
    address_unrestricted: String(data.data?.address?.unrestricted_value ?? ""),
    management_name: String(data.data?.management?.name ?? ""),
    management_post: String(data.data?.management?.post ?? ""),
    okved: String(data.data?.okved ?? ""),
  };
}

function sanitizeFmsUnit(data: DadataSuggestion): Record<string, unknown> {
  return {
    value: String(data.value ?? ""),
    code: String(data.data?.code ?? ""),
    name: String(data.data?.name ?? ""),
    region_code: String(data.data?.region_code ?? ""),
  };
}

function sanitizeFio(data: DadataSuggestion): Record<string, unknown> {
  return {
    value: String(data.value ?? ""),
    surname: String(data.data?.surname ?? ""),
    name: String(data.data?.name ?? ""),
    patronymic: String(data.data?.patronymic ?? ""),
    gender: String(data.data?.gender ?? ""),
    birthdate: String(data.data?.birthdate ?? ""),
    passport_series: String(data.data?.passport_series ?? ""),
    passport_number: String(data.data?.passport_number ?? ""),
    passport_issue_date: String(data.data?.passport_issue_date ?? ""),
    passport_issued_by: String(data.data?.passport_issued_by ?? ""),
    passport_code: String(data.data?.passport_code ?? ""),
    snils: String(data.data?.snils ?? ""),
    inn: String(data.data?.inn ?? ""),
  };
}

async function postHandler(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: { op?: string; query?: string; count?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const { op, query, count = 10 } = body;
  if (!op || typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "bad params" }, { status: 400 });
  }

  // H4: только серверный ключ. Клиентский apiKey запрещён — это был открытый
  // прокси чужого ключа (утечка лимитов/оплаты DADATA + потенциальный SSRF).
  const effectiveKey = process.env.DADATA_API_KEY;
  if (!effectiveKey) {
    return NextResponse.json(
      { error: "DADATA_API_KEY not configured", fallback: true },
      { status: 503 }
    );
  }

  // Подписка обязательна только для «дорогих» ops (ФИО, паспорта, компании).
  // Адреса и коды подразделений ФМС — открыты всем: это самое частое действие
  // при заполнении договора, а бесплатный лимит Dadata покрывает адреса.
  // Раньше здесь стоял общий gate — не-подписчики молча получали пустые
  // подсказки (жалоба: «адреса не подгружаются»).
  const FREE_OPS = new Set(["suggest-address", "suggest-fms-unit"]);
  if (!FREE_OPS.has(op) && !(await hasActiveSubscription())) {
    return NextResponse.json(
      { error: "subscription required", fallback: true },
      { status: 503 }
    );
  }

  const rl = await checkRateLimit(limiters.dadata, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  if (query.length > 200) {
    return NextResponse.json({ error: "query too long" }, { status: 400 });
  }
  const safeCount = Math.min(Math.max(Number(count) || 10, 1), 10);

  let endpoint = "";
  let cacheable = false;
  if (op === "find-party") {
    endpoint = "/findById/party";
    cacheable = true;
  } else if (op === "suggest-party") {
    endpoint = "/suggest/party";
  } else if (op === "suggest-fio") {
    endpoint = "/suggest/fio";
  } else if (op === "find-fio") {
    endpoint = "/findById/fio";
    cacheable = true;
  } else if (op === "suggest-passport") {
    endpoint = "/suggest/passport";
  } else if (op === "suggest-address") {
    endpoint = "/suggest/address";
  } else if (op === "suggest-fms-unit") {
    endpoint = "/suggest/fms_unit";
  } else {
    return NextResponse.json({ error: "unknown op" }, { status: 400 });
  }

  if (cacheable) {
    const cached = partyCache.get(query.trim());
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json(cached.body);
    }
  }

  try {
    const upstream = await fetch(DADATA_HOST + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${effectiveKey}`,
      },
      body: JSON.stringify({ query: query.trim(), count: safeCount }),
      cache: "no-store",
    });

    if (upstream.status === 401 || upstream.status === 403) {
      return NextResponse.json({ error: "invalid DADATA key" }, { status: 502 });
    }
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `dadata error ${upstream.status}` },
        { status: 502 }
      );
    }

    const upstreamJson = (await upstream.json()) as { suggestions?: unknown[] };
    const suggestions = (upstreamJson.suggestions ?? []).map((s) =>
      op === "suggest-address"
        ? s
        : op === "suggest-fms-unit"
          ? sanitizeFmsUnit(s as DadataSuggestion)
          : op === "suggest-fio" || op === "find-fio" || op === "suggest-passport"
            ? sanitizeFio(s as DadataSuggestion)
            : sanitizeParty(s as DadataSuggestion)
    );
    const result = { suggestions };

    if (cacheable) {
      partyCache.set(query.trim(), { ts: Date.now(), body: result });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "upstream unreachable" }, { status: 502 });
  }
}

export const POST = withCsrf(postHandler);