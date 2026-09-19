// @vitest-environment node
//
// Юнит-тесты checkOcsp / checkCrl (UKEP: реальные проверки отзыва).
// HTTP-слой замокан через options.fetchImpl — внешних запросов нет.
// Ответы OCSP/CRL строятся на лету средствами pkijs + asn1js (см. известные
// рецепты: certStatus кодируется как ASN.1-блок CHOICE, а не число .status).

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as p from "pkijs";
import * as a from "asn1js";
import { checkOcsp, _clearOcspCache } from "@/lib/ocsp";
import { checkCrl, _clearCrlCache } from "@/lib/crl";
import { assertSafeRevocationUrl } from "@/lib/revocation-url";

// ---------- фикстуры ----------

function bytesFromHex(hex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hex, "hex"));
}

function makeCert(serialHex: string): p.Certificate {
  const cert = new p.Certificate();
  const bytes = bytesFromHex(serialHex);
  (cert as unknown as { serialNumber: unknown }).serialNumber = new a.Integer({
    valueHex: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
  });
  return cert;
}

type OcspFixtureStatus = "good" | "revoked" | "unknown";

function buildOcspResponseDer(serialHex: string, status: OcspFixtureStatus): ArrayBuffer {
  const basic = new p.BasicOCSPResponse();
  basic.tbsResponseData.responderID = new a.OctetString({ valueHex: new Uint8Array([1, 2, 3]) });
  basic.tbsResponseData.producedAt = new Date();

  const certID = new p.CertID();
  certID.hashAlgorithm = new p.AlgorithmIdentifier({ algorithmId: "1.3.14.3.2.26" }); // SHA-1
  (certID as unknown as { issuerNameHash: unknown }).issuerNameHash = new a.OctetString({
    valueHex: new Uint8Array(20).fill(1),
  });
  (certID as unknown as { issuerKeyHash: unknown }).issuerKeyHash = new a.OctetString({
    valueHex: new Uint8Array(20).fill(2),
  });
  (certID as unknown as { serialNumber: unknown }).serialNumber = new a.Integer({
    valueHex: bytesFromHex(serialHex),
  });

  const resp = new p.SingleResponse({ certID });
  resp.certStatus =
    status === "good"
      ? new a.Primitive({ idBlock: { tagClass: 3, tagNumber: 0 } })
      : status === "revoked"
        ? new a.Constructed({
            idBlock: { tagClass: 3, tagNumber: 1 },
            value: [new a.GeneralizedTime({ valueDate: new Date(Date.now() - 86400000) })],
          })
        : new a.Primitive({ idBlock: { tagClass: 3, tagNumber: 2 }, lenBlock: { length: 1 } });
  resp.thisUpdate = new Date(Date.now() - 60000);
  resp.nextUpdate = new Date(Date.now() + 300000);
  basic.tbsResponseData.responses.push(resp);

  // Ключевое: без tbsView toSchema вернёт непроверяемую схему (Repeated →
  // "this.value[i].toBER is not a function").
  (basic.tbsResponseData as unknown as { tbsView: Uint8Array }).tbsView = new Uint8Array(
    basic.tbsResponseData.toSchema(true).toBER(false),
  );
  const basicRaw = basic.toSchema().toBER(false);

  const or = new p.OCSPResponse({
    responseStatus: new a.Enumerated({ value: 0 }),
    responseBytes: new p.ResponseBytes({
      responseType: p.id_PKIX_OCSP_Basic,
      response: new a.OctetString({ valueHex: new Uint8Array(basicRaw) }),
    }),
  });
  return (or.toSchema as unknown as (encodeFlag?: boolean) => { toBER(sizeOnly?: boolean): ArrayBuffer })(true).toBER(false);
}

function buildCrlDer(serialHex: string, opts: { includeSerial?: boolean } = {}): ArrayBuffer {
  const { includeSerial = true } = opts;
  const issuer = new p.RelativeDistinguishedNames();
  issuer.typesAndValues = [
    new p.AttributeTypeAndValue({ type: "2.5.4.3", value: new a.Utf8String({ value: "Test CA" }) }),
  ];
  const sigAlg = new p.AlgorithmIdentifier({ algorithmId: "1.3.14.3.2.26" });

  const revoked: p.RevokedCertificate[] = includeSerial
    ? [
        new p.RevokedCertificate({
          userCertificate: new a.Integer({ valueHex: bytesFromHex(serialHex) }),
          revocationDate: new p.Time({ type: 0, value: new Date(Date.now() - 3600000) }),
        }),
      ]
    : [];

  const crl = new p.CertificateRevocationList({
    version: 1,
    signature: sigAlg,
    issuer,
    thisUpdate: new p.Time({ type: 0, value: new Date(Date.now() - 86400000) }),
    nextUpdate: new p.Time({ type: 0, value: new Date(Date.now() + 86400000) }),
    revokedCertificates: revoked,
    signatureAlgorithm: sigAlg,
    signatureValue: new a.BitString(),
  });
  (crl as unknown as { tbs: ArrayBuffer }).tbs = (
    crl as unknown as { encodeTBS(): { toBER(sizeOnly?: boolean): ArrayBuffer } }
  )
    .encodeTBS()
    .toBER(false);
  return crl.toSchema(true).toBER(false) as ArrayBuffer;
}

// ---------- тесты ----------

describe("checkOcsp (UKEP: OCSP через fetchImpl)", () => {
  beforeEach(() => {
    _clearOcspCache();
  });

  it("OCSP good → status 'valid'", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => new Response(buildOcspResponseDer("0A0B0C0D", "good")));

    const result = await checkOcsp(cert, "https://ocsp.test/ocsp", { fetchImpl: fetchImpl as typeof fetch, skipSignatureCheck: true });

    expect(result.status).toBe("valid");
    expect(result.method).toBe("OCSP");
    expect(result.ocspUrl).toBe("https://ocsp.test/ocsp");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].method).toBe("POST");
  });

  it("OCSP revoked → status 'revoked'", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => new Response(buildOcspResponseDer("0A0B0C0D", "revoked")));

    const result = await checkOcsp(cert, "https://ocsp.test/ocsp", { fetchImpl: fetchImpl as typeof fetch, skipSignatureCheck: true });

    expect(result.status).toBe("revoked");
  });

  it("Ошибка сети (fetch reject) → status 'offline'", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    });

    const result = await checkOcsp(cert, "https://ocsp.test/ocsp", { fetchImpl: fetchImpl as typeof fetch, skipSignatureCheck: true });

    expect(result.status).toBe("offline");
    expect(result.details).toMatch(/ECONNREFUSED/);
  });

  it("HTTP 500 → status 'offline'", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => new Response("boom", { status: 500 }));

    const result = await checkOcsp(cert, "https://ocsp.test/ocsp", { fetchImpl: fetchImpl as typeof fetch, skipSignatureCheck: true });

    expect(result.status).toBe("offline");
    expect(result.details).toMatch(/HTTP status: 500/);
  });

  it("Кэш: повторный вызов не делает второй fetch", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => new Response(buildOcspResponseDer("0A0B0C0D", "good")));
    const opts = { fetchImpl: fetchImpl as typeof fetch, skipSignatureCheck: true };

    const first = await checkOcsp(cert, "https://ocsp.test/ocsp", opts);
    const second = await checkOcsp(cert, "https://ocsp.test/ocsp", opts);

    expect(first.status).toBe("valid");
    expect(second.status).toBe("valid");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

describe("checkCrl (UKEP: CRL через fetchImpl)", () => {
  beforeEach(() => {
    _clearCrlCache();
  });

  it("CRL с серийным номером в revokedCertificates → status 'revoked'", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => new Response(buildCrlDer("0A0B0C0D"), {
      headers: { "Content-Type": "application/pkix-crl" },
    }));

    const result = await checkCrl(cert as unknown as p.Certificate, "https://crl.test/dp.crl", {
      fetchImpl: fetchImpl as typeof fetch,
      skipSignatureCheck: true,
    });

    expect(result.status).toBe("revoked");
    expect(result.method).toBe("CRL");
    expect(result.revokedCount).toBe(1);
  });

  it("CRL без серийника в списке → status 'valid'", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => new Response(buildCrlDer("DEADBEEF", { includeSerial: false }), {
      headers: { "Content-Type": "application/pkix-crl" },
    }));

    const result = await checkCrl(cert as unknown as p.Certificate, "https://crl.test/dp.crl", {
      fetchImpl: fetchImpl as typeof fetch,
      skipSignatureCheck: true,
    });

    expect(result.status).toBe("valid");
  });

  it("Таймаут (AbortController срабатывает) → status 'offline'", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(
      (_url: string, init: RequestInit | undefined) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );

    const result = await checkCrl(cert as unknown as p.Certificate, "https://crl.test/dp.crl", {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      timeoutMs: 50,
    });

    expect(result.status).toBe("offline");
    expect(result.details).toMatch(/aborted/);
  });

  it("HTTP 500 → status 'offline'", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => new Response("boom", { status: 500 }));

    const result = await checkCrl(cert as unknown as p.Certificate, "https://crl.test/dp.crl", {
      fetchImpl: fetchImpl as typeof fetch,
      skipSignatureCheck: true,
    });

    expect(result.status).toBe("offline");
    expect(result.details).toMatch(/HTTP status: 500/);
  });

  it("Кэш: повторный вызов не делает второй fetch, статус revoked сохраняется", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => new Response(buildCrlDer("0A0B0C0D"), {
      headers: { "Content-Type": "application/pkix-crl" },
    }));
    const opts = { fetchImpl: fetchImpl as typeof fetch, skipSignatureCheck: true };

    const first = await checkCrl(cert as unknown as p.Certificate, "https://crl.test/dp.crl", opts);
    const second = await checkCrl(cert as unknown as p.Certificate, "https://crl.test/dp.crl", opts);

    expect(first.status).toBe("revoked");
    expect(second.status).toBe("revoked");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

// ---------- безопасность: fail-closed и SSRF-guard ----------

describe("fail-closed: непроверенная подпись не даёт статус valid", () => {
  beforeEach(() => {
    _clearOcspCache();
    _clearCrlCache();
  });

  it("OCSP good без проверки подписи → 'unknown' (не 'valid')", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => new Response(buildOcspResponseDer("0A0B0C0D", "good")));

    const result = await checkOcsp(cert, "https://ocsp.test/ocsp", {
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result.status).toBe("unknown");
    expect(result.signatureVerified).toBe(false);
    expect(result.details).toMatch(/not verified/i);
  });

  it("CRL good без проверки подписи → 'unknown' (не 'valid')", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => new Response(buildCrlDer("DEADBEEF", { includeSerial: false }), {
      headers: { "Content-Type": "application/pkix-crl" },
    }));

    const result = await checkCrl(cert as unknown as p.Certificate, "https://crl.test/dp.crl", {
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result.status).toBe("unknown");
    expect(result.signatureVerified).toBe(false);
  });

  it("CRL revoked остаётся 'revoked' даже без проверки подписи (fail-safe)", async () => {
    const cert = makeCert("0A0B0C0D");
    const fetchImpl = vi.fn(async () => new Response(buildCrlDer("0A0B0C0D"), {
      headers: { "Content-Type": "application/pkix-crl" },
    }));

    const result = await checkCrl(cert as unknown as p.Certificate, "https://crl.test/dp.crl", {
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result.status).toBe("revoked");
  });
});

describe("assertSafeRevocationUrl (SSRF / HTTPS guard)", () => {
  it("принимает https с публичным хостом", () => {
    expect(assertSafeRevocationUrl("https://ocsp.example.com/ocsp").hostname).toBe("ocsp.example.com");
  });

  it("отклоняет http://", () => {
    expect(() => assertSafeRevocationUrl("http://ocsp.example.com")).toThrow(/insecure_scheme/);
  });

  it("отклоняет file:// и прочие схемы", () => {
    expect(() => assertSafeRevocationUrl("file:///etc/passwd")).toThrow(/insecure_scheme/);
  });

  it("отклоняет loopback / приватные / link-local адреса", () => {
    expect(() => assertSafeRevocationUrl("https://127.0.0.1/ocsp")).toThrow(/blocked_host/);
    expect(() => assertSafeRevocationUrl("https://10.0.0.5/ocsp")).toThrow(/blocked_host/);
    expect(() => assertSafeRevocationUrl("https://192.168.1.1/ocsp")).toThrow(/blocked_host/);
    expect(() => assertSafeRevocationUrl("https://169.254.1.1/ocsp")).toThrow(/blocked_host/);
    expect(() => assertSafeRevocationUrl("https://[::1]/ocsp")).toThrow(/blocked_host/);
    expect(() => assertSafeRevocationUrl("https://localhost/ocsp")).toThrow(/blocked_host/);
  });

  it("отклоняет внутренние имена (*.local, *.internal)", () => {
    expect(() => assertSafeRevocationUrl("https://ca.internal/ocsp")).toThrow(/blocked_host/);
    expect(() => assertSafeRevocationUrl("https://ocsp.local/ocsp")).toThrow(/blocked_host/);
  });

  it("allowInsecure пропускает http (только для тестов)", () => {
    expect(assertSafeRevocationUrl("http://ocsp.test", { allowInsecure: true }).protocol).toBe("http:");
  });

  it("allowlist ограничивает хосты", () => {
    expect(() => assertSafeRevocationUrl("https://evil.com/ocsp", { allowedHosts: ["ca.gov.ru"] })).toThrow(
      /host_not_allowed/,
    );
    expect(
      assertSafeRevocationUrl("https://ocsp.ca.gov.ru/ocsp", { allowedHosts: ["ca.gov.ru"] }).hostname,
    ).toBe("ocsp.ca.gov.ru");
  });
});