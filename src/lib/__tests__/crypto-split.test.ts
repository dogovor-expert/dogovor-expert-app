import { describe, it, expect } from "vitest";
import {
  toBase64Url,
  fromBase64Url,
  encryptJsonForShare,
  decryptJsonFromShare,
  isEncryptedShare,
} from "@/lib/crypto";
import {
  hashPassword,
  verifyPassword,
  hashToken,
} from "@/lib/crypto.server";
import {
  encodeShareState,
  decodeShareState,
  encodeShareStateV2,
  decodeShareStateV2,
} from "@/lib/shareState";

describe("crypto.ts — чисто клиентские примитивы (Web Crypto)", () => {
  it("base64url round-trip сохраняет байты", () => {
    const original = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255]);
    const encoded = toBase64Url(original);
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
    const decoded = fromBase64Url(encoded);
    expect(Array.from(decoded)).toEqual(Array.from(original));
  });

  it("encryptJsonForShare → decryptJsonFromShare возвращает объект", async () => {
    const payload = { fio: "Иванов Иван", price: 150000, ok: true };
    const { d, k } = await encryptJsonForShare(payload);
    expect(isEncryptedShare(d)).toBe(true);
    const restored = await decryptJsonFromShare<typeof payload>(d, k);
    expect(restored).toEqual(payload);
  });

  it("ciphertext (d) не содержит ключа", async () => {
    const payload = { secret: "данные" };
    const { d, k } = await encryptJsonForShare(payload);
    expect(d).not.toContain(k);
  });

  it("неверный ключ → null", async () => {
    const payload = { a: 1 };
    const { d } = await encryptJsonForShare(payload);
    const wrongKey = toBase64Url(new Uint8Array(32).fill(7));
    expect(await decryptJsonFromShare(d, wrongKey)).toBeNull();
  });

  it("повреждённый ciphertext → null", async () => {
    const payload = { a: 1 };
    const { d, k } = await encryptJsonForShare(payload);
    const tampered = d.slice(0, -4) + "AAAA";
    expect(await decryptJsonFromShare(tampered, k)).toBeNull();
  });

  it("isEncryptedShare для произвольной строки — false", () => {
    expect(isEncryptedShare(null)).toBe(false);
    expect(isEncryptedShare("")).toBe(false);
    expect(isEncryptedShare("plain")).toBe(false);
  });
});

describe("crypto.server.ts — серверные scrypt/SHA-256", () => {
  it("hashPassword → verifyPassword round-trip", () => {
    const hash = hashPassword("какой-то пароль");
    expect(hash.startsWith("scrypt:")).toBe(true);
    expect(verifyPassword("какой-то пароль", hash)).toBe(true);
  });

  it("verifyPassword отклоняет неверный пароль", () => {
    const hash = hashPassword("правильный");
    expect(verifyPassword("неверный", hash)).toBe(false);
  });

  it("один и тот же пароль даёт разные salt'ы", () => {
    const a = hashPassword("одинаковый");
    const b = hashPassword("одинаковый");
    expect(a).not.toBe(b);
    expect(verifyPassword("одинаковый", a)).toBe(true);
    expect(verifyPassword("одинаковый", b)).toBe(true);
  });

  it("verifyPassword отклоняет мусорный формат", () => {
    expect(verifyPassword("x", "")).toBe(false);
    expect(verifyPassword("x", "scrypt:abc")).toBe(false);
    expect(verifyPassword("x", "plain:text")).toBe(false);
    expect(verifyPassword("x", "scrypt:a:b:c")).toBe(false);
  });

  it("hashToken — стабильный SHA-256 hex", () => {
    const token = "some-unlock-token";
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(hashToken(token + "x"));
  });
});

describe("shareState — конвейер между crypto.ts и потребителями", () => {
  it("legacy lz-string encode/decode round-trip", () => {
    const payload = { values: { fio: "Иванов", price: "150000" } };
    const encoded = encodeShareState(payload);
    expect(encoded.length).toBeGreaterThan(0);
    expect(decodeShareState(encoded)).toEqual(payload);
  });

  it("v2 zero-knowledge encode/decode round-trip", async () => {
    const payload = { values: { fio: "Петров Петр", passport: "1234 567890" } };
    const { d, k } = await encodeShareStateV2(payload);
    expect(isEncryptedShare(d)).toBe(true);
    expect(k.length).toBeGreaterThan(0);
    const restored = await decodeShareStateV2(d, k);
    expect(restored).toEqual(payload);
  });

  it("v2 без ключа (или без d) → null", async () => {
    const payload = { values: { x: "1" } };
    const { d } = await encodeShareStateV2(payload);
    expect(await decodeShareStateV2(d, null)).toBeNull();
    expect(await decodeShareStateV2(null, "whatever")).toBeNull();
  });

  it("v2 с подделанным key → null (нет утечки)", async () => {
    const payload = { values: { x: "secret" } };
    const { d } = await encodeShareStateV2(payload);
    const tamperedK = toBase64Url(new Uint8Array(32).fill(9));
    expect(await decodeShareStateV2(d, tamperedK)).toBeNull();
  });

  it("legacy lz-string не использует префикс v2 (без шифрования)", () => {
    const payload = { values: { y: "2" } };
    const encoded = encodeShareState(payload);
    expect(isEncryptedShare(encoded)).toBe(false);
  });
});