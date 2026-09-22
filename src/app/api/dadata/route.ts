import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit, rateLimitResponse, clientIp } from "@/lib/ratelimit";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { dadataSchema, validateBody } from "@/lib/validations/api";
import { boundedCacheSet } from "@/lib/bounded-cache";

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

// Безопасное приведение значения Dadata к строке. Поля приходят как `unknown`
// (могут быть объектом/числом/null), поэтому нельзя вызывать String() на объекте —
// иначе получится "[object Object]". Возвращаем "" для всего, кроме скаляров.
function str(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function sanitizeParty(data: DadataSuggestion): Record<string, unknown> {
  const nameObj = data.data?.name;
  const isNameObj = typeof nameObj === "object" && nameObj !== null;
  return {
    value: str(data.value),
    inn: str(data.data?.inn),
    kpp: str(data.data?.kpp),
    ogrn: str(data.data?.ogrn),
    type: str(data.data?.type),
    status: str(data.data?.state?.status),
    name_short_with_opf: str(isNameObj ? nameObj.short_with_opf : undefined),
    name_full_with_opf: str(isNameObj ? nameObj.full_with_opf : undefined),
    address_value: str(data.data?.address?.value),
    address_unrestricted: str(data.data?.address?.unrestricted_value),
    management_name: str(data.data?.management?.name),
    management_post: str(data.data?.management?.post),
    okved: str(data.data?.okved),
  };
}

function sanitizeFmsUnit(data: DadataSuggestion): Record<string, unknown> {
  return {
    value: str(data.value),
    code: str(data.data?.code),
    name: str(data.data?.name),
    region_code: str(data.data?.region_code),
  };
}

function sanitizeFio(data: DadataSuggestion): Record<string, unknown> {
  return {
    value: str(data.value),
    surname: str(data.data?.surname),
    name: str(data.data?.name),
    patronymic: str(data.data?.patronymic),
    gender: str(data.data?.gender),
    birthdate: str(data.data?.birthdate),
    passport_series: str(data.data?.passport_series),
    passport_number: str(data.data?.passport_number),
    passport_issue_date: str(data.data?.passport_issue_date),
    passport_issued_by: str(data.data?.passport_issued_by),
    passport_code: str(data.data?.passport_code),
    snils: str(data.data?.snils),
    inn: str(data.data?.inn),
  };
}

async function postHandler(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // P1: Zod-валидация входящего body (best practice 2026: safeParse + structured error)
  const parsed: unknown = await req.json().catch(() => null);
  const validated = validateBody(dadataSchema, parsed);
  if (!validated.success) return validated.error;
  const { op, query, count } = validated.data;
  const safeCount = count;

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
  const FREE_OPS = new Set([
    "suggest-address",
    "suggest-fms-unit",
    "suggest-court",
  ]);
  if (!FREE_OPS.has(op) && !(await hasActiveSubscription())) {
    return NextResponse.json(
      { error: "subscription required", fallback: true },
      { status: 503 }
    );
  }

  const rl = await checkRateLimit(limiters.dadata, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

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
  } else if (op === "suggest-court") {
    endpoint = "/suggest/court";
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
      boundedCacheSet(partyCache, query.trim(), { ts: Date.now(), body: result }, CACHE_TTL_MS);
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "upstream unreachable" }, { status: 502 });
  }
}

export const POST = withCsrf(postHandler);