// @vitest-environment node
import { describe, it, expect } from "vitest";
import { computeHash, mapHashOidToAlgorithm } from "@/lib/pades-verify";
import { gostCrypto } from "node-gost-crypto";

describe("pades-verify computeHash (GOST routing)", () => {
  it("считает ГОСТ R 34.11-2012-256 через gostCrypto (а не native crypto.subtle)", async () => {
    const data = new TextEncoder().encode("test");
    const hex = await computeHash("GOST R 34.11-2012-256", data);
    expect(hex).toHaveLength(64);
    // Известный вектор: GOST R 34.11-2012-256('test')
    expect(hex).toBe("12a50838191b5504f1e5f2fd078714cf6b592b9d29af99d0b10d8d02881c3857");
  });

  it("считает ГОСТ R 34.11-2012-512 через gostCrypto", async () => {
    const data = new TextEncoder().encode("hello");
    const hex = await computeHash("GOST R 34.11-2012-512", data);
    expect(hex).toHaveLength(128);
  });

  it("совпадает с прямым gostCrypto.subtle.digest", async () => {
    const data = new TextEncoder().encode("quick brown fox");
    const viaCompute = await computeHash("GOST R 34.11-2012-256", data);
    const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    const direct = await gostCrypto.subtle.digest("GOST R 34.11-2012-256", buf as BufferSource);
    expect(viaCompute).toBe(Buffer.from(direct).toString("hex"));
  });

  it("не кидает NotSupportedError для ГОСТ (native crypto.subtle его отклоняет)", async () => {
    const data = new TextEncoder().encode("abc");
    await expect(computeHash("GOST R 34.11-2012-256", data)).resolves.toHaveLength(64);
  });
});

describe("mapHashOidToAlgorithm", () => {
  it("маппит ГОСТ OID на ГОСТ-алгоритм с isGost=true", () => {
    expect(mapHashOidToAlgorithm("1.2.643.7.1.1.2.2")).toEqual({ algorithm: "GOST R 34.11-2012-256", isGost: true });
    expect(mapHashOidToAlgorithm("1.2.643.7.1.1.2.3")).toEqual({ algorithm: "GOST R 34.11-2012-512", isGost: true });
    expect(mapHashOidToAlgorithm("1.2.643.2.2.19")).toEqual({ algorithm: "GOST R 34.11-94", isGost: true });
  });

  it("маппит SHA OID на non-GOST", () => {
    expect(mapHashOidToAlgorithm("2.16.840.1.101.3.4.2.1")).toEqual({ algorithm: "SHA-256", isGost: false });
    expect(mapHashOidToAlgorithm("2.16.840.1.101.3.4.2.3")).toEqual({ algorithm: "SHA-512", isGost: false });
  });

  it("неизвестный OID → unknown/isGost:false", () => {
    expect(mapHashOidToAlgorithm("1.2.3.4")).toEqual({ algorithm: "unknown", isGost: false });
  });
});