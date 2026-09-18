import { promises as fs } from "node:fs";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseTslXml, type TslData, type TslParserOptions } from "@/lib/tsl-parser";

const TSL_URL = "https://e-trust.gosuslugi.ru/CA/DownloadTSL?schemaVersion=0";
const FETCH_TIMEOUT_MS = 30_000;
const TSL_CACHE_FILE = process.env.TSL_CACHE_FILE || "/tmp/tsl-cache.xml";

export interface FetcherOptions extends TslParserOptions {
  source?: "remote" | "file" | "cache" | "db" | "fresh";
  filePath?: string;
}

export interface TslRawCacheRow {
  raw_xml: string;
  tsl_version: number;
  tsl_date: string;
  fetched_at: string;
}

export async function fetchTslFromRemote(
  options: Omit<FetcherOptions, "source" | "filePath"> = {}
): Promise<{ data: TslData; rawXml: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(TSL_URL, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Dogovor-Expert/1.0 (TSL-Fetcher)",
        Accept: "application/xml, text/xml, */*",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const rawXml = await response.text();
    const data = await parseTslXml(rawXml, { ...options, source: "remote" });
    return { data, rawXml };
  } finally {
    clearTimeout(timeout);
  }
}

export async function loadTslFromFile(
  filePath: string,
  options: Omit<FetcherOptions, "source" | "filePath"> = {}
): Promise<{ data: TslData; rawXml: string }> {
  const rawXml = await fs.readFile(filePath, "utf-8");
  const data = await parseTslXml(rawXml, { ...options, source: "file" });
  return { data, rawXml };
}

export async function loadTslFromCache(
  options: Omit<FetcherOptions, "source" | "filePath"> = {}
): Promise<{ data: TslData; rawXml: string } | null> {
  try {
    return await loadTslFromFile(TSL_CACHE_FILE, options);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw e;
  }
}

export async function loadTslFromDb(
  options: Omit<FetcherOptions, "source" | "filePath"> = {}
): Promise<{ data: TslData; rawXml: string } | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null;
    }
    const admin = createAdminClient();
    const cacheResult = await admin
      .from("tsl_raw_cache")
      .select("raw_xml, tsl_version, tsl_date")
      .eq("id", 1)
      .maybeSingle();

    if (cacheResult.error || !cacheResult.data) return null;

    const rawRow: unknown = cacheResult.data;
    const row = rawRow as { raw_xml: string };
    const parsed = await parseTslXml(row.raw_xml, { ...options, source: "db" });
    return { data: parsed, rawXml: row.raw_xml };
  } catch (e) {
    console.warn("[tsl-fetcher] DB cache read failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

export async function saveTslToDb(rawXml: string): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env for DB cache");
  }
  const parsed = await parseTslXml(rawXml, { verifySignature: false, source: "db" });
  const admin = createAdminClient();
  const { error } = await admin.from("tsl_raw_cache").upsert(
    {
      id: 1,
      raw_xml: rawXml,
      tsl_version: parsed.metadata.version,
      tsl_date: parsed.metadata.date,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function saveTslToCache(rawXml: string): Promise<void> {
  await fs.writeFile(TSL_CACHE_FILE, rawXml, "utf-8");
}

export async function fetchAndCacheTsl(
  options: FetcherOptions = {}
): Promise<{ data: TslData; rawXml: string; fromCache: boolean }> {
  const cached =
    (await loadTslFromDb(options)) ??
    (await loadTslFromCache(options).catch(() => null));

  if (cached) {
    const cacheAge = Date.now() - new Date(cached.data.metadata.date).getTime();
    const maxAge = options.source === "fresh" ? 0 : 24 * 60 * 60 * 1000;
    if (cacheAge < maxAge) {
      return { ...cached, fromCache: true };
    }
  }

  const fresh = await fetchTslFromRemote(options);
  await saveTslToDb(fresh.rawXml).catch((e) => {
    console.warn("[tsl-fetcher] Failed to persist TSL to DB:", e instanceof Error ? e.message : e);
  });
  await saveTslToCache(fresh.rawXml).catch(() => {});
  return { ...fresh, fromCache: false };
}

export { TSL_URL, TSL_CACHE_FILE };