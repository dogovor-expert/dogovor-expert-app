// @vitest-environment node
// E2E-тесты сквозного контура УКЭП:
//   signPdfWithCryptoPro (VirtualCadesPlugin) → verifyPAdESCrypto.
// Виртуальный плагин подписывает данные настоящим ГОСТ Р 34.10-2012/256
// через node-gost-crypto; TSA-атрибут 1.2.840.113549.1.9.16.2.14 добавляется
// в unsignedAttrs через pkijs (не входит в подпись → подпись валидна).

import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { PDFDocument } from "pdf-lib";
import { signPdfWithCryptoPro } from "@/lib/signCryptoPro";
import { verifyPAdESCrypto } from "@/lib/pades-verify";
import { createVirtualGostPki, installVirtualCadesPlugin, TSA_TIMESTAMP_OID, type VirtualGostPki } from "@/lib/__tests__/mocks/virtual-cadesplugin";
import * as certParser from "@/lib/cert-parser";
import * as ocspModule from "@/lib/ocsp";
import * as crlModule from "@/lib/crl";
import * as pkijs from "pkijs";

// Тесты проверяют криптографию ГОСТ-подписи, а не TSL-цепочку доверия:
// при заданных SUPABASE-env getTrustedRoots() идёт в прод-БД и легитимно
// отвергает самоподписанную тестовую цепочку. Изолируем тесты от БД.
vi.mock("@/lib/trusted-roots", () => ({
  getTrustedRoots: vi.fn(async () => []),
  clearTrustedRootsCache: vi.fn(),
}));

let pki: VirtualGostPki;
let uninstall: () => void;
let pdfBytes: Uint8Array;

async function makePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage([595, 842]);
  return new Uint8Array(await doc.save());
}

function base64ToHex(base64: string): string {
  return Buffer.from(base64, "base64").toString("hex");
}

beforeAll(async () => {
  pki = await createVirtualGostPki();
  ({ uninstall } = installVirtualCadesPlugin(pki));
  pdfBytes = await makePdf();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ukep e2e pipeline (VirtualCadesPlugin + verifyPAdESCrypto)", () => {
  it("1. подписывает PDF через сryptoPro-API и верифицирует ГОСТ-подпись (cryptoVerified: true)", async () => {
    const signature = await signPdfWithCryptoPro(pdfBytes, pki.thumbprint, { addTimestamp: false });
    const cmsHex = base64ToHex(signature);

    const result = await verifyPAdESCrypto(pdfBytes, pdfBytes, cmsHex);

    expect(result.valid).toBe(true);
    expect(result.cryptoVerified).toBe(true);
    expect(result.integrity.hashMatch).toBe(true);
    expect(result.revocation.status).toBe("unknown");
  });

  it("2. OCSP-отзыв: verify возвращает valid:false и ошибку отзыва", async () => {
    // node-gost-сертификат не несёт AIA/CDP — инжектируем OCSP URL на уровне
    // getExtensions (из него pades-verify берёт ocspUrls при отзыве).
    const realGetExtensions = certParser.getExtensions;
    vi.spyOn(certParser, "getExtensions").mockImplementation((cert) => ({
      ...realGetExtensions(cert),
      ocspUrls: ["http://ocsp.test.example/"],
      crlDistributionPoints: [],
    }));
    vi.spyOn(ocspModule, "checkOcsp").mockResolvedValue({
      status: "revoked",
      method: "OCSP",
      checkedAt: new Date(),
    } as never);

    const signature = await signPdfWithCryptoPro(pdfBytes, pki.thumbprint, { addTimestamp: false });
    const result = await verifyPAdESCrypto(pdfBytes, pdfBytes, base64ToHex(signature));

    expect(result.valid).toBe(false);
    expect(result.cryptoVerified).toBe(true);
    expect(result.revocation.status).toBe("revoked");
    expect(result.errors.some((e) => /revoked/i.test(e))).toBe(true);
  });

  it("3. CRL-отзыв (серийный номер в списке): документ отклоняется", async () => {
    const realGetExtensions = certParser.getExtensions;
    vi.spyOn(certParser, "getExtensions").mockImplementation((cert) => ({
      ...realGetExtensions(cert),
      ocspUrls: [],
      crlDistributionPoints: ["http://crl.test.example/ca.crl"],
    }));
    vi.spyOn(crlModule, "checkCrl").mockResolvedValue({
      status: "revoked",
      method: "CRL",
      checkedAt: new Date(),
    } as never);

    const signature = await signPdfWithCryptoPro(pdfBytes, pki.thumbprint, { addTimestamp: false });
    const result = await verifyPAdESCrypto(pdfBytes, pdfBytes, base64ToHex(signature));

    expect(result.valid).toBe(false);
    expect(result.revocation.status).toBe("revoked");
    expect(result.errors.some((e) => /revoked/i.test(e))).toBe(true);
  });

  it("4. offline (сбой сети при проверке отзыва): valid:true + предупреждение", async () => {
    const realGetExtensions = certParser.getExtensions;
    vi.spyOn(certParser, "getExtensions").mockImplementation((cert) => ({
      ...realGetExtensions(cert),
      ocspUrls: ["http://ocsp.test.example/"],
      crlDistributionPoints: [],
    }));
    vi.spyOn(ocspModule, "checkOcsp").mockResolvedValue({
      status: "offline",
      method: "OCSP",
      checkedAt: new Date(),
      details: "network unreachable",
    } as never);

    const signature = await signPdfWithCryptoPro(pdfBytes, pki.thumbprint, { addTimestamp: false });
    const result = await verifyPAdESCrypto(pdfBytes, pdfBytes, base64ToHex(signature));

    expect(result.valid).toBe(true);
    expect(result.cryptoVerified).toBe(true);
    expect(result.revocation.status).toBe("offline");
    expect(result.warnings.some((w) => /offline/i.test(w))).toBe(true);
  });

  it("5. TSA: настоящий RFC 3161 токен проходит криптоверификацию (TICKET-4)", async () => {
    const signature = await signPdfWithCryptoPro(pdfBytes, pki.thumbprint, { addTimestamp: true });
    const cmsHex = base64ToHex(signature);
    const cmsBytes = Buffer.from(cmsHex, "hex");

    // Проверяем наличие TSA-атрибута на уровне ASN.1 (pkijs)
    const ab = cmsBytes.buffer.slice(cmsBytes.byteOffset, cmsBytes.byteOffset + cmsBytes.byteLength) as ArrayBuffer;
    const ci = pkijs.ContentInfo.fromBER(ab);
    const sd = new pkijs.SignedData({ schema: ci.content });
    const unsigned = sd.signerInfos[0].unsignedAttrs as unknown as { attributes?: Array<{ type?: unknown }> } | undefined;
    const hasTsa = Boolean(unsigned?.attributes?.some((a) => String(a.type) === TSA_TIMESTAMP_OID));
    expect(hasTsa).toBe(true);

    // Подпись после перекодировки CMS с TSA остаётся валидной
    const result = await verifyPAdESCrypto(pdfBytes, pdfBytes, cmsHex);
    expect(result.cryptoVerified).toBe(true);
    expect(result.timestamp.present).toBe(true);
    // getTrustedRoots замокан на [] → штамп криптографически валиден,
    // но цепочка TSA не проверялась (chainOk:false) — это не блокирует вердикт.
    expect(result.timestamp.status).toBe("valid");
    expect(result.timestamp.chainOk).toBe(false);
    expect(result.timestamp.genTime).toBeInstanceOf(Date);
    expect(result.valid).toBe(true);
  });
});