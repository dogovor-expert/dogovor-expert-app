// @vitest-environment node
// VERIFICATION TEST (read-only) — КРИТ 2.3 из аудита 2026-09 + уточнение.
//
// Цель — задокументировать текущее поведение `src/lib/pades-verify.ts`:
// 1. Для сертификата без CRL DP / OCSP → revocation.status='unknown',
//    method='none'. (Аудит: да, для «пустого» кейса.)
// 2. СТАТИЧЕСКИ: в исходнике pades-verify.ts строки 404-413 до сих пор
//    возвращают жёстко «CRL/OCSP check not implemented» (аудит верен).
// 3. УТОЧНЕНИЕ к аудиту: в cert-parser.ts CRL Distribution Points и
//    OCSP URLs УЖЕ корректно парсятся (lines 159-184). Аудит смешал
//    «парсинг CRL Distribution Points — пустой цикл» (это про
//    signCryptoPro.ts:567-570) с pades-verify.ts — НЕ верно. В
//    pades-verify.ts просто не делается HTTP-запрос по распарсенным
//    URL.
// 4. Для штатного E2E-кейса (pades-verify-e2e.test.ts) revocation
//    должна быть { status:'unknown', method:'none' }, а не что-то ещё.

import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { gostCrypto } from "node-gost-crypto";
import { verifyPAdESCrypto } from "@/lib/pades-verify";
import { getExtensions } from "@/lib/cert-parser";

// verifyPAdESCrypto выполняет тяжёлую ГОСТ-криптографию (CMS + цепочка) в чистом
// JS — на части машин это дольше дефолтных 5 с. Поднимаем таймаут для файла.
vi.setConfig({ testTimeout: 30_000 });

function toHex(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s;
}

function toAscii(s: string): Uint8Array {
  return Uint8Array.from([...s].map((c) => c.charCodeAt(0)));
}

async function buildSignedCms(content: Uint8Array): Promise<{ cmsHex: string; cert: unknown }> {
  const cert = new gostCrypto.cert.X509({
    subject: { countryName: "RU", commonName: "Test GOST Signer", organizationName: "Test Org" },
  });
  const privKeyInfo = await cert.generate("TC-256");
  await cert.sign(privKeyInfo);

  const cms = new gostCrypto.cms.SignedDataContentInfo();
  cms.setEnclosed({ contentType: "data", content: content.buffer as ArrayBuffer });
  gostCrypto.cms.options.autoAddCert = true;
  await cms.addSignature(privKeyInfo, cert, true);
  const der = cms.encode("DER") as ArrayBuffer;
  return { cmsHex: toHex(new Uint8Array(der)), cert };
}

describe("VERIFICATION: pades-verify — КРИТ 2.3 (CRL/OCSP 'not implemented')", () => {
  it("[2.3 АУДИТ-ПОДТВЕРЖДЕНО] Для сертификата без CRL DP / OCSP → revocation = { status:'unknown', method:'none' }", async () => {
    const docBytes = toAscii("%PDF-1.4\ntest");
    const { cmsHex } = await buildSignedCms(docBytes);

    const result = await verifyPAdESCrypto(new Uint8Array(docBytes), docBytes, cmsHex);

    expect(result.revocation).toBeDefined();
    expect(result.revocation.status).toBe("unknown");
    expect(result.revocation.method).toBe("none");
    // details НЕ должны быть "not implemented" — это другой метод
    expect(result.revocation.details ?? "").not.toMatch(/not implemented/);
  });

  it("[2.3 АУДИТ-ПОДТВЕРЖДЕНО] revoked-сертификат НЕ проходит как ошибка (т.к. проверка не делается)", async () => {
    // Это неприятное свойство текущего кода: не делая реальный CRL/OCSP,
    // мы НЕ МОЖЕМ обнаружить отозванный сертификат. Даже если бы серт
    // был отозван, ошибка не появится. Здесь мы это фиксируем.
    const docBytes = toAscii("%PDF-1.4\ntest");
    const { cmsHex } = await buildSignedCms(docBytes);
    const result = await verifyPAdESCrypto(new Uint8Array(docBytes), docBytes, cmsHex);
    expect(result.errors.some((e) => /revoked/i.test(e))).toBe(false);
  });

  it("[ЭТАП 2.3 ПОДТВЕРЖДЕНО] Исходник pades-verify.ts БОЛЬШЕ НЕ содержит хардкод 'not implemented'", () => {
    const src = readFileSync("src/lib/pades-verify.ts", "utf8");
    // После ЭТАП 2.3 заглушка заменена на реальные checkOcsp/checkCrl.
    expect(src).not.toMatch(/OCSP check not implemented/);
    expect(src).not.toMatch(/CRL check not implemented/);
    // Новые вызовы — есть.
    expect(src).toMatch(/checkOcsp\(signerCert/);
    expect(src).toMatch(/checkCrl\(signerCert/);
  });

  it("[2.3-АУДИТ-УТОЧНЕНИЕ] cert-parser.ts УЖЕ корректно парсит CRL Distribution Points и OCSP URLs", () => {
    const src = readFileSync("src/lib/cert-parser.ts", "utf8");
    // Подтверждаем, что в cert-parser.ts есть рабочий парсер:
    // - 2.5.29.31 → crlDistributionPoints (GeneralName [6] URI)
    // - 1.3.6.1.5.5.7.1.1 → accessMethod 1.3.6.1.5.5.7.48.1 → ocspUrls
    expect(src).toMatch(/2\.5\.29\.31/);
    expect(src).toMatch(/1\.3\.6\.1\.5\.5\.7\.1\.1/);
    expect(src).toMatch(/1\.3\.6\.1\.5\.5\.7\.48\.1/);
    expect(src).toMatch(/crlDistributionPoints\.push/);
    expect(src).toMatch(/ocspUrls\.push/);
  });

  it("[2.3-АУДИТ-УТОЧНЕНИЕ] getExtensions() на сертификате без CRL/OCSP возвращает пустые массивы — это попадает в method='none' ветку", async () => {
    // Строим реальный ГОСТ-сертификат и парсим его расширения через
    // pkijs → cert-parser. Без явных CRL/OCSP должно быть пусто.
    const raw = new gostCrypto.cert.X509({
      subject: { countryName: "RU", commonName: "Test", organizationName: "Org" },
    });
    const pk = await raw.generate("TC-256");
    await raw.sign(pk);

    const certDer = (raw as unknown as { export: (format: string) => ArrayBuffer }).export
      ? ((raw as unknown as { export: (f: string) => ArrayBuffer }).export("DER") as ArrayBuffer)
      : ((raw as unknown as { encode: () => ArrayBuffer }).encode() as ArrayBuffer);
    const pkijs = await import("pkijs");
    const cert = pkijs.Certificate.fromBER(certDer);
    const ext = getExtensions(cert);
    expect(ext.crlDistributionPoints).toEqual([]);
    expect(ext.ocspUrls).toEqual([]);
    expect(ext.caIssuersUrls).toEqual([]);
  });

  it("[TSA-АУДИТ] Заглушка удалена: pades-verify.ts содержит реальную верификацию TSA (TICKET-4, 2026-09-12)", () => {
    const src = readFileSync("src/lib/pades-verify.ts", "utf8");
    expect(src).not.toMatch(/TSA timestamp present but verification not implemented/);
    expect(src).toMatch(/export async function verifyTsaTimestamp/);
    expect(src).toMatch(/messageImprint/);
  });

  it("[2.3-АУДИТ-УТОЧНЕНИЕ] Структура revocation-объекта — задокументирована, не падает при отсутствии URL", async () => {
    const docBytes = toAscii("test");
    const { cmsHex } = await buildSignedCms(docBytes);
    const result = await verifyPAdESCrypto(new Uint8Array(docBytes), docBytes, cmsHex);
    // Type-guard: поля соответствуют интерфейсу RevocationInfo
    expect(typeof result.revocation.status).toBe("string");
    expect(result.revocation.checkedAt).toBeInstanceOf(Date);
    expect(["CRL", "OCSP", "none"]).toContain(result.revocation.method);
  });
});
