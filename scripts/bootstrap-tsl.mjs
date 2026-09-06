#!/usr/bin/env node
// Bootstrap TSL into Supabase from a local TSL XML file.
// Uses SUPABASE_SERVICE_ROLE_KEY (from .env.local) — requires the
// 20260907 (tsl_certificates) and 20260908 (tsl_raw_cache) migrations to be applied.
//
// Usage (from project root, so tsx resolves @/ aliases):
//   npx tsx scripts/bootstrap-tsl.mjs [path-to-tsl.xml]

import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_TSL = path.join(os.homedir(), "Downloads", "сертификат", "tsl.xml");
const tslPath = process.argv[2] || DEFAULT_TSL;

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const out = {};
  if (existsSync(envPath)) {
    const text = readFileSync(envPath, "utf-8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const v = m[2].replace(/^["']|["']$/g, "");
      out[m[1]] = v;
    }
  }
  return out;
}

const env = loadEnv();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

async function main() {
  if (!existsSync(tslPath)) {
    console.error(`❌ TSL file not found: ${tslPath}`);
    process.exit(1);
  }
  let rawXml;
  try {
    rawXml = readFileSync(tslPath, "utf-8");
  } catch (e) {
    throw new Error(`Cannot read TSL file: ${e.message}`);
  }
  console.log(`📄 Read TSL: ${(rawXml.length / 1024 / 1024).toFixed(1)} MB`);

  const { parseTslXml, getRootCaCertificates, getAllValidCertificates } = await import(
    "../src/lib/tsl-parser.ts"
  );

  const tslData = await parseTslXml(rawXml, { verifySignature: true, source: "file" });
  if (!tslData.metadata.signatureValid) {
    throw new Error(
      `TSL XMLDSig signature verification FAILED: ${tslData.metadata.signatureError || "invalid signature"}`
    );
  }
  console.log(
    `🔏 XMLDSig подпись TSL валидна (signer subject: ${JSON.stringify(tslData.metadata.signatureError ?? "")})`
  );
  const rootCerts = getRootCaCertificates(tslData);
  const allValidCerts = getAllValidCertificates(tslData);
  console.log(
    `✅ Parsed: v${tslData.metadata.version}, ${tslData.authorities.length} CAs, ${rootCerts.length} roots, ${allValidCerts.length} valid certs`
  );

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

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

  console.log(`🔄 Upserting ${rows.length} certificates into tsl_certificates...`);
  const { error: upsertError } = await admin
    .from("tsl_certificates")
    .upsert(rows, { onConflict: "thumbprint" });
  if (upsertError) {
    console.error("❌ tsl_certificates upsert failed:", upsertError.message);
    process.exit(1);
  }
  console.log("✅ Certificates inserted");

  console.log("💾 Saving raw XML to tsl_raw_cache...");
  const { error: rawError } = await admin.from("tsl_raw_cache").upsert(
    {
      id: 1,
      raw_xml: rawXml,
      tsl_version: tslData.metadata.version,
      tsl_date: tslData.metadata.date,
      fetched_at: now,
    },
    { onConflict: "id" }
  );
  if (rawError) {
    console.warn("⚠️ tsl_raw_cache save warning:", rawError.message);
  } else {
    console.log("✅ Raw XML cached in DB");
  }

  const { error: metaError } = await admin
    .from("tsl_sync_metadata")
    .update({
      last_sync_at: now,
      last_version: tslData.metadata.version,
      last_date: tslData.metadata.date,
      total_certificates: rows.length,
      root_certificates: rootCerts.length,
      last_error: null,
      last_error_at: null,
    })
    .eq("id", 1);
  if (metaError) {
    console.warn("⚠️ tsl_sync_metadata update warning:", metaError.message);
  } else {
    console.log("✅ Sync metadata updated");
  }

  console.log("\n🎉 Bootstrap complete: v" + tslData.metadata.version);
}

main().catch((e) => {
  console.error("❌ FAILED:", e.message);
  process.exit(1);
});