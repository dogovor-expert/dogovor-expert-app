import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isSameOrigin } from "../admin-auth";

function req(method: string, headers: Record<string, string> = {}): Request {
  return new Request("https://dogovor.expert/api/ai/balance", { method, headers });
}

describe("isSameOrigin", () => {
  const orig = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://dogovor.expert";
  });
  afterEach(() => {
    if (orig === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = orig;
  });

  it("GET без Origin/Referer (браузер на same-origin GET) — разрешён", () => {
    expect(isSameOrigin(req("GET"))).toBe(true);
    expect(isSameOrigin(req("HEAD"))).toBe(true);
  });

  it("мутирующий метод без Origin — отклонён", () => {
    expect(isSameOrigin(req("POST"))).toBe(false);
    expect(isSameOrigin(req("DELETE"))).toBe(false);
  });

  it("Origin совпадает с сайтом — разрешён (любой метод)", () => {
    expect(isSameOrigin(req("POST", { origin: "https://dogovor.expert" }))).toBe(true);
    expect(isSameOrigin(req("GET", { origin: "https://dogovor.expert" }))).toBe(true);
  });

  it("чужой Origin — отклонён", () => {
    expect(isSameOrigin(req("POST", { origin: "https://evil.example" }))).toBe(false);
    expect(isSameOrigin(req("GET", { origin: "https://evil.example" }))).toBe(false);
  });

  it("битый Origin — отклонён", () => {
    expect(isSameOrigin(req("GET", { origin: "not-a-url" }))).toBe(false);
  });

  it("Sec-Fetch-Site: same-origin без Origin — разрешён", () => {
    expect(isSameOrigin(req("GET", { "sec-fetch-site": "same-origin" }))).toBe(true);
    expect(isSameOrigin(req("POST", { "sec-fetch-site": "same-origin" }))).toBe(true);
  });

  it("Sec-Fetch-Site: cross-site без Origin — отклонён", () => {
    expect(isSameOrigin(req("GET", { "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(isSameOrigin(req("POST", { "sec-fetch-site": "cross-site" }))).toBe(false);
  });

  it("Sec-Fetch-Site: same-site без Origin — отклонён (поддомены не доверяем)", () => {
    expect(isSameOrigin(req("GET", { "sec-fetch-site": "same-site" }))).toBe(false);
  });

  it("Sec-Fetch-Site: none — разрешён только для безопасных методов", () => {
    expect(isSameOrigin(req("GET", { "sec-fetch-site": "none" }))).toBe(true);
    expect(isSameOrigin(req("POST", { "sec-fetch-site": "none" }))).toBe(false);
  });
});
