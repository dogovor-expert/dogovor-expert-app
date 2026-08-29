import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DADATA_HOST = "https://suggestions.dadata.ru/suggestions/api/4_1/rs";

interface RateEntry {
  hits: number[];
}

const ipHits = new Map<string, RateEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 часа для findById/party
const partyCache = new Map<string, { ts: number; body: unknown }>();

const RATE_LIMIT_PER_MIN = 40;

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

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip) ?? { hits: [] };
  entry.hits = entry.hits.filter((t) => now - t < 60_000);
  if (entry.hits.length >= RATE_LIMIT_PER_MIN) return false;
  entry.hits.push(now);
  ipHits.set(ip, entry);
  return true;
}

function sanitizeParty(data: any): Record<string, unknown> {
  return {
    value: String(data.value ?? ""),
    inn: String(data.data?.inn ?? ""),
    kpp: String(data.data?.kpp ?? ""),
    ogrn: String(data.data?.ogrn ?? ""),
    type: String(data.data?.type ?? ""),
    status: String(data.data?.state?.status ?? ""),
    name_short_with_opf: String(data.data?.name?.short_with_opf ?? ""),
    name_full_with_opf: String(data.data?.name?.full_with_opf ?? ""),
    address_value: String(data.data?.address?.value ?? ""),
    address_unrestricted: String(data.data?.address?.unrestricted_value ?? ""),
    management_name: String(data.data?.management?.name ?? ""),
    management_post: String(data.data?.management?.post ?? ""),
    okved: String(data.data?.okved ?? ""),
  };
}

function sanitizeFmsUnit(data: any): Record<string, unknown> {
  return {
    value: String(data.value ?? ""),
    code: String(data.data?.code ?? ""),
    name: String(data.data?.name ?? ""),
    region_code: String(data.data?.region_code ?? ""),
  };
}

function sanitizeFio(data: any): Record<string, unknown> {
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

export async function POST(req: NextRequest) {
  if (!process.env.DADATA_API_KEY) {
    // Клиентский компромисс не нужен: фронт при 503 использует локальный ключ.
    return NextResponse.json(
      { error: "DADATA_API_KEY not configured", fallback: true },
      { status: 503 }
    );
  }

  // Серверный ключ расходуется только подписчиками: бесплатные пользователи
  // автозаполняют реквизиты собственным ключом на бесплатном тарифе DADATA.
  if (!(await hasActiveSubscription())) {
    return NextResponse.json(
      { error: "subscription required", fallback: true },
      { status: 503 }
    );
  }

  const ip = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "local";
  if (!checkRate(ip)) {
    return NextResponse.json({ error: "rate limit" }, { status: 429 });
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
        Authorization: `Token ${process.env.DADATA_API_KEY}`,
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
          ? sanitizeFmsUnit(s as Record<string, unknown>)
          : op === "suggest-fio" || op === "find-fio" || op === "suggest-passport"
            ? sanitizeFio(s as Record<string, unknown>)
            : sanitizeParty(s as Record<string, unknown>)
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