// TICKET-4: криптографическая верификация TSA-штампа (RFC 3161).
// Токен генерируется виртуальной TSA-инфраструктурой (node-gost-crypto,
// ГОСТ Р 34.10-2012/256) — тесты проверяют verifyTsaTimestamp без сети.

import { describe, it, expect, beforeAll, vi } from "vitest";
import { createHash } from "node:crypto";
import * as pkijs from "pkijs";
import * as asn1js from "asn1js";
import {
  getVirtualTsaPki,
  buildRealTsaToken,
  type VirtualTsaPki,
} from "./mocks/virtual-cadesplugin";

const caDerHolder: { der: Uint8Array | null } = { der: null };

vi.mock("@/lib/trusted-roots", () => ({
  getTrustedRoots: vi.fn(async () => {
    if (!caDerHolder.der) return [];
    const ab = caDerHolder.der.buffer.slice(
      caDerHolder.der.byteOffset,
      caDerHolder.der.byteOffset + caDerHolder.der.byteLength,
    ) as ArrayBuffer;
    return [
      {
        cert: pkijs.Certificate.fromBER(ab),
        thumbprintSha1: createHash("sha1").update(Buffer.from(caDerHolder.der)).digest("hex").toUpperCase(),
      },
    ];
  }),
  clearTrustedRootsCache: vi.fn(),
}));

import { verifyTsaTimestamp } from "@/lib/pades-verify";

let tsaPki: VirtualTsaPki;
const MAIN_SIG = new Uint8Array(64).fill(0xab);

function tokenValue(tokenDer: Uint8Array): asn1js.AsnType {
  const res = asn1js.fromBER(
    tokenDer.buffer.slice(tokenDer.byteOffset, tokenDer.byteOffset + tokenDer.byteLength) as ArrayBuffer,
  );
  if (res.offset === -1 || !res.result) throw new Error("token parse failed");
  return res.result;
}

beforeAll(async () => {
  tsaPki = await getVirtualTsaPki();
  caDerHolder.der = tsaPki.caDer;
});

describe("verifyTsaTimestamp (TICKET-4)", () => {
  it("валидный токен + доверенный корень → status valid, chainOk true", async () => {
    const token = await buildRealTsaToken(MAIN_SIG, tsaPki);
    const r = await verifyTsaTimestamp(tokenValue(token), MAIN_SIG);
    expect(r.status).toBe("valid");
    expect(r.chainOk).toBe(true);
    expect(r.genTime).toBeInstanceOf(Date);
    expect(r.tsaSubject?.cn).toBe("Test TSA Responder");
  });

  it("messageImprint не совпадает (подмена подписи) → invalid (fail-closed)", async () => {
    const token = await buildRealTsaToken(MAIN_SIG, tsaPki);
    const other = new Uint8Array(64).fill(0xcd);
    const r = await verifyTsaTimestamp(tokenValue(token), other);
    expect(r.status).toBe("invalid");
    expect(r.details).toMatch(/messageImprint/i);
  });

  it("цепочка не доверенная (пустые trusted roots → chainOk:false, но valid)", async () => {
    caDerHolder.der = null; // getTrustedRoots вернёт []
    try {
      const token = await buildRealTsaToken(MAIN_SIG, tsaPki);
      const r = await verifyTsaTimestamp(tokenValue(token), MAIN_SIG);
      expect(r.status).toBe("valid");
      expect(r.chainOk).toBe(false);
    } finally {
      caDerHolder.der = tsaPki.caDer;
    }
  });

  it("чужой корень в trusted roots → invalid (untrusted self-signed)", async () => {
    // Генерируем ДРУГУЮ самоподписанную пару и доверяем только ей.
    const { gostCrypto } = await import("node-gost-crypto");
    const alien = new gostCrypto.cert.X509({
      subject: { countryName: "RU", commonName: "Alien Root" },
    });
    const alienKey = await alien.generate("TC-256");
    await alien.sign(alienKey);
    const saved = caDerHolder.der;
    caDerHolder.der = new Uint8Array(alien.encode("DER"));
    try {
      const token = await buildRealTsaToken(MAIN_SIG, tsaPki);
      const r = await verifyTsaTimestamp(tokenValue(token), MAIN_SIG);
      expect(r.status).toBe("invalid");
      expect(r.details).toMatch(/chain/i);
    } finally {
      caDerHolder.der = saved;
    }
  });

  it("битый/фейковый токен (не SignedData) → invalid", async () => {
    const fake = new Uint8Array([0x30, 0x0c, 0x06, 0x08, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x04, 0x00]);
    const r = await verifyTsaTimestamp(tokenValue(fake), MAIN_SIG);
    expect(r.status).toBe("invalid");
  });

  it("genTime вне срока действия сертификата TSA → invalid", async () => {
    const token = await buildRealTsaToken(MAIN_SIG, tsaPki, new Date("2019-01-01T00:00:00Z"));
    const r = await verifyTsaTimestamp(tokenValue(token), MAIN_SIG);
    expect(r.status).toBe("invalid");
    expect(r.details).toMatch(/genTime/i);
  });
});
