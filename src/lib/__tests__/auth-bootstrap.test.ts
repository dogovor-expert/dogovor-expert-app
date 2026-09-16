import { describe, it, expect } from "vitest";
import { parseSupabaseAuthCookie } from "@/lib/auth/bootstrap";

const SESSION = {
  access_token: "tok-123",
  refresh_token: "rt-456",
  token_type: "bearer",
  expires_in: 3600,
};

function cookieString(name: string, payload: unknown): string {
  return `${name}=${encodeURIComponent(JSON.stringify(payload))}`;
}

describe("parseSupabaseAuthCookie (@supabase/ssr ghost-session)", () => {
  it("парсит обычную JSON-куку sb-<ref>-auth-token", () => {
    const raw = cookieString("sb-xkakhztknlpzqarklewq-auth-token", {
      currentSession: SESSION,
      expiresAt: Date.now() + 3600_000,
    });
    expect(parseSupabaseAuthCookie(raw)).toEqual({
      access_token: "tok-123",
      refresh_token: "rt-456",
    });
  });

  it("парсит currentSession как JSON-строку (формат gotrue storage)", () => {
    const raw = cookieString("sb-proj-auth-token", {
      currentSession: JSON.stringify(SESSION),
    });
    expect(parseSupabaseAuthCookie(raw)?.access_token).toBe("tok-123");
  });

  it("склеивает чанкованную куку -0/-1", () => {
    const full = encodeURIComponent(JSON.stringify({ currentSession: SESSION }));
    const mid = Math.ceil(full.length / 2);
    const cookie = [
      `sb-proj-auth-token-0=${full.slice(0, mid)}`,
      `sb-proj-auth-token-1=${full.slice(mid)}`,
      "other=1",
    ].join("; ");
    const parsed = parseSupabaseAuthCookie(cookie);
    expect(parsed?.refresh_token).toBe("rt-456");
  });

  it("base64-формат (ssr >= 0.12) тоже парсится", () => {
    const b64 = btoa(JSON.stringify({ currentSession: SESSION }));
    const parsed = parseSupabaseAuthCookie(`sb-proj-auth-token=${b64}`);
    expect(parsed?.access_token).toBe("tok-123");
  });

  it("актуальный формат @supabase/ssr 0.12 (префикс base64- + base64url) парсится", () => {
    const json = JSON.stringify(SESSION);
    const b64url = btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const parsed = parseSupabaseAuthCookie(`sb-proj-auth-token=base64-${b64url}`);
    expect(parsed).toEqual({ access_token: "tok-123", refresh_token: "rt-456" });
  });

  it("склеивает чанки с разделителем-точкой .0/.1 (актуальный формат)", () => {
    const json = JSON.stringify(SESSION);
    const b64url = btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const full = `base64-${b64url}`;
    const mid = Math.ceil(full.length / 2);
    const cookie = [
      `sb-proj-auth-token.0=${full.slice(0, mid)}`,
      `sb-proj-auth-token.1=${full.slice(mid)}`,
    ].join("; ");
    const parsed = parseSupabaseAuthCookie(cookie);
    expect(parsed?.refresh_token).toBe("rt-456");
  });

  it("пустая/нулевая сессия → null", () => {
    expect(
      parseSupabaseAuthCookie(cookieString("sb-proj-auth-token", { currentSession: null }))
    ).toBeNull();
    expect(parseSupabaseAuthCookie('sb-proj-auth-token=""')).toBeNull();
    expect(parseSupabaseAuthCookie("theme=dark; csrf=abc")).toBeNull();
    expect(parseSupabaseAuthCookie("")).toBeNull();
  });

  it("мусор вместо JSON не бросает исключение", () => {
    expect(parseSupabaseAuthCookie("sb-proj-auth-token=not-json{{{")).toBeNull();
  });
});
