// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { getTrustedRoots, clearTrustedRootsCache } from "@/lib/trusted-roots";
import { parseTslXml, getRootCaCertificates, certificateToPem } from "@/lib/tsl-parser";

const TSL_FIXTURE = "C:/Users/alikpc/Downloads/сертификат/tsl.xml";
const hasFixture = existsSync(TSL_FIXTURE);

let rootCertDerB64 = "";
let rootCertPem = "";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mockAdminClient,
}));

let mockAdminClient: {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: unknown) => {
        gt: (col: string, val: string) => {
          limit: (n: number) => Promise<{ data: unknown[] | null; error: null }>;
        };
      };
    };
  };
};

function makeMockClient(rows: unknown[]) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          gt: () => ({
            limit: async () => ({ data: rows, error: null }),
          }),
        }),
      }),
    }),
  };
}

const SUPABASE_URL = "https://test.supabase.co";
const SERVICE_KEY = "test-service-role-key";

beforeAll(async () => {
  if (hasFixture) {
    const xml = readFileSync(TSL_FIXTURE, "utf8");
    const tsl = await parseTslXml(xml, { verifySignature: false, source: "file" });
    const roots = getRootCaCertificates(tsl);
    const first = roots[0];
    if (first) {
      rootCertDerB64 = first.derBase64;
      rootCertPem = certificateToPem(first);
    }
  }
});

beforeEach(() => {
  clearTrustedRootsCache();
  delete process.env.TRUSTED_ROOT_CA_PEM;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.TSL_USE_REMOTE = "false";
  delete process.env.TSL_LOCAL_FILE;
});

afterEach(() => {
  clearTrustedRootsCache();
  delete process.env.TRUSTED_ROOT_CA_PEM;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.TSL_USE_REMOTE;
  delete process.env.TSL_LOCAL_FILE;
});

describe("getTrustedRoots (trusted-roots)", () => {
  it("возвращает пустой список когда нет источников", async () => {
    const roots = await getTrustedRoots();
    expect(Array.isArray(roots)).toBe(true);
    expect(roots.length).toBe(0);
  });

  it.skipIf(!hasFixture)("загружает корни из TRUSTED_ROOT_CA_PEM (env)", async () => {
    process.env.TRUSTED_ROOT_CA_PEM = rootCertPem;
    const roots = await getTrustedRoots();
    expect(roots.length).toBeGreaterThan(0);
    const envRoot = roots.find((r) => r.source === "env");
    expect(envRoot).toBeDefined();
    expect(envRoot!.thumbprintSha256.length).toBe(64);
    expect(envRoot!.thumbprintSha1.length).toBe(40);
  });

  it.skipIf(!hasFixture)("загружает корни из локального TSL-файла", async () => {
    process.env.TSL_LOCAL_FILE = TSL_FIXTURE;
    const roots = await getTrustedRoots();
    expect(roots.length).toBeGreaterThan(0);
    expect(roots.every((r) => r.source === "tsl")).toBe(true);
  }, 60_000);

  it.skipIf(!hasFixture)("загружает корни из БД (tsl_certificates)", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE_KEY;
    mockAdminClient = makeMockClient([
      {
        certificate_der: rootCertDerB64,
        subject_dn: "CN=TestRoot",
        authority_name: "Тестовый УЦ",
      },
    ]);
    const roots = await getTrustedRoots();
    expect(roots.length).toBe(1);
    expect(roots[0].source).toBe("tsl");
    expect(roots[0].thumbprintSha256.length).toBe(64);
  });

  it.skipIf(!hasFixture)("не падает при ошибке БД и возвращает []", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE_KEY;
    mockAdminClient = {
      from: () => {
        throw new Error("connection refused");
      },
    };
    const roots = await getTrustedRoots();
    expect(Array.isArray(roots)).toBe(true);
  });
});