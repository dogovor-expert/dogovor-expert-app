import * as pkijs from "pkijs";
import type { Certificate } from "pkijs";
import { createAdminClient } from "@/lib/supabase/admin";
import { getThumbprints, type ParsedSubject, parseSubject, parseIssuer, getValidity, getExtensions } from "@/lib/cert-parser";
import { getRootCaCertificates, type TslCertificate } from "@/lib/tsl-parser";
import { fetchAndCacheTsl, loadTslFromCache, loadTslFromFile, loadTslFromDb } from "@/lib/tsl-fetcher";

export interface TrustedRoot {
  cert: Certificate;
  subject: ParsedSubject;
  issuer: ParsedSubject;
  validFrom: Date;
  validTo: Date;
  thumbprintSha1: string;
  thumbprintSha256: string;
  extensions: ReturnType<typeof getExtensions>;
  source: "tsl" | "env" | "registry";
  authorityName?: string;
}

let cachedRoots: TrustedRoot[] | null = null;
let lastFetch = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN CERTIFICATE-----/g, "")
    .replace(/-----END CERTIFICATE-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function parseCertFromPem(pem: string, source: TrustedRoot["source"], authorityName?: string): Promise<TrustedRoot | null> {
  try {
    const der = pemToDer(pem);
    const cert = pkijs.Certificate.fromBER(der);
    const subject = parseSubject(cert);
    const issuer = parseIssuer(cert);
    const { notBefore, notAfter } = getValidity(cert);
    const { sha1, sha256 } = await getThumbprints(cert);
    const extensions = getExtensions(cert);
    return {
      cert,
      subject,
      issuer,
      validFrom: notBefore,
      validTo: notAfter,
      thumbprintSha1: sha1,
      thumbprintSha256: sha256,
      extensions,
      source,
      authorityName,
    };
  } catch (e) {
    console.warn("[trusted-roots] Failed to parse CA:", e);
    return null;
  }
}

async function tslCertificateToTrustedRoot(tslCert: TslCertificate, authorityName: string): Promise<TrustedRoot | null> {
  try {
    const subject = parseSubject(tslCert.parsed);
    const issuer = parseIssuer(tslCert.parsed);
    const extensions = getExtensions(tslCert.parsed);
    const { sha1, sha256 } = await getThumbprints(tslCert.parsed);
    return {
      cert: tslCert.parsed,
      subject,
      issuer,
      validFrom: tslCert.notBefore,
      validTo: tslCert.notAfter,
      thumbprintSha1: sha1,
      thumbprintSha256: sha256,
      extensions,
      source: "tsl",
      authorityName,
    };
  } catch (e) {
    console.warn(`[trusted-roots] Failed to convert TSL cert from ${authorityName}:`, e);
    return null;
  }
}

async function loadFromEnv(): Promise<TrustedRoot[]> {
  const pemList = process.env.TRUSTED_ROOT_CA_PEM?.split("|").filter(Boolean) ?? [];
  const roots: TrustedRoot[] = [];
  for (const pem of pemList) {
    const parsed = await parseCertFromPem(pem, "env");
    if (parsed) roots.push(parsed);
  }
  return roots;
}

function base64DerToCert(base64: string): Certificate {
  const binary = Buffer.from(base64, "base64");
  return pkijs.Certificate.fromBER(binary);
}

interface DbRootRow {
  certificate_der: string;
  subject_dn: string;
  authority_name: string;
}

function dbRowToTrustedRoot(row: DbRootRow): TrustedRoot {
  const cert = base64DerToCert(row.certificate_der);
  const subject = parseSubject(cert);
  const issuer = parseIssuer(cert);
  const { notBefore, notAfter } = getValidity(cert);
  const extensions = getExtensions(cert);
  return {
    cert,
    subject,
    issuer,
    validFrom: notBefore,
    validTo: notAfter,
    thumbprintSha1: "",
    thumbprintSha256: "",
    extensions,
    source: "tsl",
    authorityName: row.authority_name || row.subject_dn,
  };
}

async function loadRootsFromDb(): Promise<TrustedRoot[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return [];
    }
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("tsl_certificates")
      .select("certificate_der, subject_dn, authority_name")
      .eq("is_root", true)
      .gt("not_after", new Date().toISOString())
      .limit(500);

    if (error) {
      console.warn("[trusted-roots] DB root query failed:", error.message);
      return [];
    }

    const roots: TrustedRoot[] = [];
    for (const row of (data || []) as DbRootRow[]) {
      try {
        const root = dbRowToTrustedRoot(row);
        if (!root.thumbprintSha1) {
          const { sha1, sha256 } = await getThumbprints(root.cert);
          root.thumbprintSha1 = sha1;
          root.thumbprintSha256 = sha256;
        }
        roots.push(root);
      } catch (e) {
        console.warn("[trusted-roots] Failed to parse DB root cert:", e instanceof Error ? e.message : e);
      }
    }
    return roots;
  } catch (e) {
    console.warn("[trusted-roots] DB root load failed:", e instanceof Error ? e.message : e);
    return [];
  }
}

async function loadFromTsl(): Promise<TrustedRoot[]> {
  try {
    const dbRoots = await loadRootsFromDb();
    if (dbRoots.length > 0) {
      console.warn(
        `[trusted-roots] Loaded ${dbRoots.length} root certs from DB (tsl_certificates)`
      );
      return dbRoots;
    }

    let tslData = null;
    const useRemote = process.env.TSL_USE_REMOTE !== "false";

    if (useRemote) {
      try {
        const result = await fetchAndCacheTsl({ verifySignature: false });
        tslData = result.data;
        console.warn(
          `[trusted-roots] TSL loaded (${result.fromCache ? "from cache/db" : "fresh"}): v${tslData.metadata.version}, ${tslData.authorities.length} CAs, ${getRootCaCertificates(tslData).length} root certs`
        );
      } catch (e) {
        console.warn("[trusted-roots] Remote TSL fetch failed, trying DB cache:", e);
        const fromDb = await loadTslFromDb({ verifySignature: false });
        if (fromDb) tslData = fromDb.data;
        else {
          const cached = await loadTslFromCache({ verifySignature: false });
          if (cached) tslData = cached.data;
        }
      }
    } else {
      const localPath = process.env.TSL_LOCAL_FILE;
      if (localPath) {
        const result = await loadTslFromFile(localPath, { verifySignature: false });
        tslData = result.data;
      } else {
        const cached = await loadTslFromCache({ verifySignature: false });
        if (cached) tslData = cached.data;
      }
    }

    if (!tslData) {
      console.warn("[trusted-roots] No TSL data available");
      return [];
    }

    const rootCerts = getRootCaCertificates(tslData);
    const roots: TrustedRoot[] = [];
    const now = Date.now();
    for (const cert of rootCerts) {
      const authorityName = tslData.authorities.find((a) =>
        a.certificates.some((c) => c.thumbprint === cert.thumbprint)
      )?.name;

      const ageMs = now - cert.notBefore.getTime();
      if (ageMs < 0) continue;

      const root = await tslCertificateToTrustedRoot(cert, authorityName || "Unknown");
      if (root) roots.push(root);
    }

    return roots;
  } catch (e) {
    console.error("[trusted-roots] TSL parsing failed:", e);
    return [];
  }
}

export async function getTrustedRoots(): Promise<TrustedRoot[]> {
  if (cachedRoots && Date.now() - lastFetch < CACHE_TTL_MS) {
    return cachedRoots;
  }

  const [envRoots, tslRoots] = await Promise.all([loadFromEnv(), loadFromTsl()]);
  const allRoots = [...tslRoots, ...envRoots];

  const seen = new Set<string>();
  const uniqueRoots = allRoots.filter((r) => {
    if (seen.has(r.thumbprintSha1)) return false;
    seen.add(r.thumbprintSha1);
    return true;
  });

  cachedRoots = uniqueRoots;
  lastFetch = Date.now();
  return uniqueRoots;
}

export function clearTrustedRootsCache(): void {
  cachedRoots = null;
  lastFetch = 0;
}