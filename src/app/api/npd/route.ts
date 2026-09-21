import { NextResponse, type NextRequest } from "next/server";
import { withCsrf } from "@/lib/csrf";
import {
  limiters,
  checkRateLimit,
  rateLimitResponse,
  clientIp,
} from "@/lib/ratelimit";
import { npdSchema, validateBody } from "@/lib/validations/api";
import { boundedCacheSet } from "@/lib/bounded-cache";
import { isValidInn } from "@/lib/inn";
import {
  NPD_ENDPOINT,
  buildNpdPayload,
  interpretNpdResponse,
  normalizeNpdDate,
} from "@/lib/npd";

// Статус НПД меняется редко → кэш 6 часов. Он же защищает от лимита ФНС
// (у сервиса ограничение на число запросов с одного IP-адреса).
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const npdCache = new Map<string, { ts: number; body: unknown }>();

async function postHandler(req: NextRequest) {
  const parsed: unknown = await req.json().catch(() => null);
  const validated = validateBody(npdSchema, parsed);
  if (!validated.success) return validated.error;
  const { inn } = validated.data;

  // Контрольное число ИНН: не гоняем заведомо некорректный ИНН в ФНС.
  if (!isValidInn(inn)) {
    return NextResponse.json(
      {
        state: "invalid",
        isSelfEmployed: false,
        message: "ИНН не прошёл проверку контрольного числа",
        inn,
      },
      { status: 400 }
    );
  }

  const date = normalizeNpdDate(validated.data.date);
  if (!date) {
    return NextResponse.json(
      { error: "invalid date", message: "Дата проверки недопустима" },
      { status: 400 }
    );
  }

  const key = `${inn}:${date}`;
  const cached = npdCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.body);
  }

  const rl = await checkRateLimit(limiters.npd, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const upstream = await fetch(NPD_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(buildNpdPayload(inn, date)),
      cache: "no-store",
      signal: controller.signal,
    });

    const body: unknown = await upstream.json().catch(() => null);
    const result = interpretNpdResponse(upstream.status, body);
    const payload = { ...result, inn, date };

    // Кэшируем только «содержательные» ответы — временные сбои и лимиты
    // не должны залипать на 6 часов.
    if (
      result.state === "self-employed" ||
      result.state === "not-self-employed"
    ) {
      boundedCacheSet(
        npdCache,
        key,
        { ts: Date.now(), body: payload },
        CACHE_TTL_MS
      );
    }
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      {
        state: "unavailable",
        isSelfEmployed: false,
        message: "Сервис ФНС недоступен, попробуйте позже",
        inn,
        date,
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timer);
  }
}

export const POST = withCsrf(postHandler);
