// Computes a deterministic SHA-256 fingerprint of a given payload using the
// browser's SubtleCrypto. Falls back to a simple 32-bit rolling hash when the
// API is not available (e.g. very old browsers or non-secure contexts).
export const computeFingerprint = async (payload: string): Promise<string> => {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(payload));
      return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    } catch (error) {
      console.warn("SubtleCrypto unavailable, using fallback hash", error);
    }
  }
  return fallbackHash(payload);
};

const fallbackHash = (payload: string): string => {
  let h1 = 0xdeadbeef ^ payload.length;
  let h2 = 0x41c6ce57 ^ payload.length;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const raw = ((h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0")).repeat(4);
  return raw.slice(0, 64);
};
