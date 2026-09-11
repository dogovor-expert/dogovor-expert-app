import { describe, it, expect } from "vitest";
import { detectImageKind, MAX_AVATAR_BYTES } from "@/lib/upload/imageValidate";

function bytes(...n: number[]): Uint8Array {
  const b = new Uint8Array(64);
  n.forEach((v, i) => (b[i] = v));
  return b;
}

function withAscii(b: Uint8Array, at: number, s: string) {
  for (let i = 0; i < s.length; i++) b[at + i] = s.charCodeAt(i);
  return b;
}

describe("detectImageKind (5.6, OWASP magic-bytes)", () => {
  it("JPEG: FF D8 FF", () => {
    expect(detectImageKind(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
  });

  it("PNG: полный 8-байтовый префикс", () => {
    expect(
      detectImageKind(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)),
    ).toBe("image/png");
  });

  it("PNG без CRLF-хвоста (неполный префикс) — отказ", () => {
    expect(detectImageKind(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x00, 0x00))).toBeNull();
  });

  it("WEBP: RIFF....WEBP", () => {
    const b = withAscii(bytes(), 0, "RIFF");
    withAscii(b, 8, "WEBP");
    expect(detectImageKind(b)).toBe("image/webp");
  });

  it("AVIF: ftyp + major brand avif", () => {
    const b = withAscii(bytes(0, 0, 0, 0x20), 4, "ftyp");
    withAscii(b, 8, "avif");
    expect(detectImageKind(b)).toBe("image/avif");
  });

  it("HEIF без avif-бренда — отказ", () => {
    const b = withAscii(bytes(0, 0, 0, 0x18), 4, "ftyp");
    withAscii(b, 8, "heic");
    expect(detectImageKind(b)).toBeNull();
  });

  it("EXE(MZ)/HTML/SVG-подпись — отказ, даже если клиент заявил image/*", () => {
    const mz = withAscii(bytes(0x4d, 0x5a), 0, "MZ");
    expect(detectImageKind(mz)).toBeNull();
    const html = withAscii(bytes(), 0, "<!doct");
    expect(detectImageKind(html)).toBeNull();
    const svg = withAscii(bytes(), 0, "<svg");
    expect(detectImageKind(svg)).toBeNull();
  });

  it("короткий буфер (<12) — отказ", () => {
    expect(detectImageKind(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });

  it("MAX_AVATAR_BYTES = 5 МБ", () => {
    expect(MAX_AVATAR_BYTES).toBe(5 * 1024 * 1024);
  });
});
