import { NextResponse } from "next/server";
import { FX_RATES } from "@/lib/legal/autoDuty";
import { checkRateLimit, clientIp, limiters, rateLimitResponse } from "@/lib/ratelimit";
import { parseCbrXml } from "@/lib/legal/cbr";

/**
 * Курс ЦБ РФ для таможенного расчёта (аудит 3.3).
 *
 * Юридическое правило: ст. 52 ТК ЕАЭС + Решение Комиссии ТС № 376 от
 * 20.09.2010 (пп. 6, 15) — пересчёт валютной стоимости по курсу ЦБ
 * на ДЕНЬ РЕГИСТРАЦИИ таможенной декларации. Для выходных/праздников
 * официальный endpoint ЦБ сам отдаёт последний опубликованный курс
 * предшествующего рабочего дня — это ровно то, что требует закон.
 *
 * Клиент не может ходить на cbr.ru напрямую (CORS), поэтому курс
 * проксируется этой route. Ответ кэшируется: курс меняется ≤ 1 раза
 * в день, поэтому кэш на 6 часов более чем достаточен.
 *
 * GET /api/customs-rate?date=YYYY-MM-DD (опционально; по умолчанию — сегодня)
 *  → { date, rates: {EUR, USD, CNY, ...}, source: "cbr" | "fallback", actualDate }
 */

/** In-memory кэш на дату (на Vercel живёт внутри warm instance). */
const cache = new Map<string, { rates: Record<string, number>; actualDate: string; ts: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 часов
const FETCH_TIMEOUT_MS = 6000;

async function fetchCbr(iso: string): Promise<{ rates: Record<string, number>; actualDate: string }> {
  const [y, m, d] = iso.split("-");
  const url = `https://www.cbr.ru/scripts/XML_daily.asp?date_req=${d}/${m}/${y}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "User-Agent": "dogovor.expert (customs duty calculator)" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`cbr http ${res.status}`);
  const xml = await res.text();
  const { rates, date } = parseCbrXml(xml);
  if (!rates.EUR) throw new Error("cbr parse: no EUR");
  const merged: Record<string, number> = { ...FX_RATES, ...rates };
  return { rates: merged, actualDate: date };
}

export async function GET(req: Request) {
  const { ok, retryAfter } = await checkRateLimit(limiters.publicForm, clientIp(req));
  if (!ok) return rateLimitResponse(retryAfter);

  const url = new URL(req.url);
  const raw = url.searchParams.get("date");
  let iso = "";
  if (raw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return NextResponse.json({ error: "invalid_date", hint: "expected YYYY-MM-DD" }, { status: 400 });
    }
    const t = new Date(raw + "T00:00:00Z").getTime();
    const min = Date.UTC(1992, 0, 1);
    const max = Date.UTC(2100, 0, 1);
    if (Number.isNaN(t) || t < min || t > max) {
      return NextResponse.json({ error: "date_out_of_range", hint: "cbr.ru publishes rates since 1992-01-01" }, { status: 400 });
    }
    iso = raw;
  } else {
    iso = new Date().toISOString().slice(0, 10);
  }

  const hit = cache.get(iso);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return NextResponse.json(
      { date: iso, rates: hit.rates, actualDate: hit.actualDate, source: "cbr", cached: true },
      { headers: { "Cache-Control": "public, max-age=21600" } },
    );
  }

  try {
    const { rates, actualDate } = await fetchCbr(iso);
    cache.set(iso, { rates, actualDate, ts: Date.now() });
    return NextResponse.json(
      { date: iso, rates, actualDate, source: "cbr" },
      { headers: { "Cache-Control": "public, max-age=21600" } },
    );
  } catch {
    // Fail-open: если ЦБ недоступен — отдаём статичный снапшот,
    // а UI честно помечает источник и предупреждает о проверке курса.
    return NextResponse.json(
      { date: iso, rates: { ...FX_RATES }, actualDate: "", source: "fallback", fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=600" } },
    );
  }
}
