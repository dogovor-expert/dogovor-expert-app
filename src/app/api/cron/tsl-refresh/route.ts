import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { fetchAndCacheTsl, loadTslFromCache, loadTslFromDb } from "@/lib/tsl-fetcher";
import { parseTslXml, getRootCaCertificates, getAllValidCertificates } from "@/lib/tsl-parser";
import { createAdminClient } from "@/lib/supabase/admin";
import { clearTrustedRootsCache } from "@/lib/trusted-roots";

/**
 * Проверка авторизации CRON-запроса (constant-time).
 * Fail-closed: если CRON_SECRET не задан в окружении — 401.
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

/**
 * Загрузка сертификатов из TSL в БД (Supabase).
 * Сохраняет только корневые и промежуточные сертификаты для быстрого поиска.
 */
async function syncTslToDatabase(rawXml: string): Promise<{ rootCount: number; totalCount: number }> {
  const admin = createAdminClient();
  const tslData = await parseTslXml(rawXml, { verifySignature: false, source: "sync" });

  const rootCerts = getRootCaCertificates(tslData);
  const allValidCerts = getAllValidCertificates(tslData);

  const now = new Date().toISOString();

  const rows = allValidCerts.map((cert) => {
    const authority = tslData.authorities.find((a) =>
      a.certificates.some((c) => c.thumbprint === cert.thumbprint)
    );
    return {
      thumbprint: cert.thumbprint,
      subject_dn: cert.subjectDN,
      issuer_dn: cert.issuerDN,
      not_before: cert.notBefore.toISOString(),
      not_after: cert.notAfter.toISOString(),
      certificate_der: cert.derBase64,
      is_root: cert.subjectDN === cert.issuerDN,
      authority_name: authority?.name || "Unknown",
      authority_inn: authority?.inn || null,
      authority_ogrn: authority?.ogrn || null,
      tsl_version: tslData.metadata.version,
      tsl_date: tslData.metadata.date,
      last_synced_at: now,
    };
  });

  if (rows.length > 0) {
    const { error } = await admin
      .from("tsl_certificates")
      .upsert(rows, { onConflict: "thumbprint", ignoreDuplicates: false });

    if (error) {
      console.error("[tsl-refresh] Database sync failed:", error);
      throw error;
    }
  }

  return { rootCount: rootCerts.length, totalCount: rows.length };
}

async function updateSyncMetadata(meta: {
  last_sync_at: string;
  last_version?: number;
  last_date?: string;
  total_certificates?: number;
  root_certificates?: number;
  last_error?: string | null;
  last_error_at?: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("tsl_sync_metadata")
    .update(meta)
    .eq("id", 1);
  if (error) {
    console.error("[tsl-refresh] Failed to update sync metadata:", error.message);
  }
}

async function handleRefresh(req: Request): Promise<NextResponse> {
  if (!authOk(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  // eslint-disable-next-line no-console -- cron-задача: лог для внешнего планировщика
  console.log("[tsl-refresh] Starting TSL refresh...");

  try {
    let result: { data: Awaited<ReturnType<typeof parseTslXml>>; rawXml: string; fromCache: boolean };
    let refreshedFromRemote = false;

    try {
      result = await fetchAndCacheTsl({ verifySignature: true });
      refreshedFromRemote = !result.fromCache;
    } catch (e) {
      const fetchError = e instanceof Error ? e.message : String(e);
      console.warn(`[tsl-refresh] Remote fetch failed (${fetchError}), falling back to DB cache`);
      const fromDb = await loadTslFromDb({ verifySignature: true });
      if (fromDb) {
        result = { ...fromDb, fromCache: true };
      } else {
        const fromCache = await loadTslFromCache({ verifySignature: true });
        if (!fromCache) throw new Error("No TSL data available in cache or DB");
        result = { ...fromCache, fromCache: true };
      }
      refreshedFromRemote = false;
    }

    if (!result.data.metadata.signatureValid) {
      throw new Error(
        `TSL XMLDSig signature verification failed: ${result.data.metadata.signatureError || "invalid signature"}`
      );
    }

    const syncResult = await syncTslToDatabase(result.rawXml);
    clearTrustedRootsCache();

    await updateSyncMetadata({
      last_sync_at: new Date().toISOString(),
      last_version: result.data.metadata.version,
      last_date: result.data.metadata.date,
      total_certificates: syncResult.totalCount,
      root_certificates: syncResult.rootCount,
      last_error: refreshedFromRemote ? null : undefined,
      last_error_at: refreshedFromRemote ? null : undefined,
    });

    const duration = Date.now() - startTime;
    // eslint-disable-next-line no-console -- cron-задача: лог для внешнего планировщика
    console.log(
      `[tsl-refresh] Completed in ${duration}ms: v${result.data.metadata.version}, ${result.data.authorities.length} CAs, ${syncResult.totalCount} certs in DB (${syncResult.rootCount} root), remote=${refreshedFromRemote}`
    );

    return NextResponse.json({
      success: true,
      duration_ms: duration,
      fromCache: result.fromCache,
      refreshedFromRemote,
      metadata: result.data.metadata,
      statistics: {
        authorities_count: result.data.authorities.length,
        root_certificates_count: syncResult.rootCount,
        total_certificates_count: syncResult.totalCount,
      },
    });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("[tsl-refresh] Failed:", error);
    await updateSyncMetadata({
      last_sync_at: new Date().toISOString(),
      last_error: error,
    }).catch(() => {});
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}

async function handleStatus(req: Request): Promise<NextResponse> {
  if (!authOk(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Лёгкий статус БЕЗ парсинга XML: полный parse+verify 12MB TSL стоит
  // ~400MB transient heap и ронял прод OOM (2026-09-28, exit 139).
  // Актуальность кэша читаем из tsl_sync_metadata + count(*) — килобайты.
  try {
    const admin = createAdminClient();
    const [metaRes, countRes] = await Promise.all([
      admin
        .from("tsl_sync_metadata")
        .select("last_sync_at, last_version, last_date, total_certificates, root_certificates, last_error, last_error_at")
        .eq("id", 1)
        .maybeSingle(),
      admin.from("tsl_certificates").select("thumbprint", { count: "exact", head: true }),
    ]);
    if (metaRes.error) throw metaRes.error;
    if (countRes.error) throw countRes.error;
    const meta = (metaRes.data ?? {}) as {
      last_sync_at?: string;
      last_version?: number;
      last_date?: string;
      total_certificates?: number;
      root_certificates?: number;
      last_error?: string | null;
      last_error_at?: string | null;
    };
    return NextResponse.json({
      cached: true,
      last_sync_at: meta.last_sync_at ?? null,
      metadata: { version: meta.last_version ?? null, date: meta.last_date ?? null },
      statistics: {
        total_certificates_count: countRes.count ?? meta.total_certificates ?? null,
        root_certificates_count: meta.root_certificates ?? null,
      },
      last_error: meta.last_error ?? null,
      last_error_at: meta.last_error_at ?? null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return handleRefresh(req);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("action") === "status") {
    return handleStatus(req);
  }
  return handleRefresh(req);
}