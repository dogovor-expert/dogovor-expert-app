import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { turnstileConfigured, verifyTurnstile } from "@/lib/turnstile";

const SECRET = "x-secret";

describe("turnstileConfigured", () => {
  const saved = process.env.TURNSTILE_SECRET_KEY;
  afterEach(() => {
    if (saved === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = saved;
  });

  it("без секрета → false", () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    expect(turnstileConfigured()).toBe(false);
  });

  it("с секретом → true", () => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    expect(turnstileConfigured()).toBe(true);
  });
});

describe("verifyTurnstile", () => {
  const saved = process.env.TURNSTILE_SECRET_KEY;
  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    if (saved === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = saved;
  });

  it("success:true → ok", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ success: true }), { status: 200 })
    ));
    expect(await verifyTurnstile("tok", "1.2.3.4")).toBe("ok");
  });

  it("success:false → fail", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }), { status: 200 })
    ));
    expect(await verifyTurnstile("tok", "1.2.3.4")).toBe("fail");
  });

  it("не-2xx от Cloudflare → unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 503 })));
    expect(await verifyTurnstile("tok", "1.2.3.4")).toBe("unavailable");
  });

  it("сетевой бросок → unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));
    expect(await verifyTurnstile("tok", "1.2.3.4")).toBe("unavailable");
  });

  it("без секрета → ok и без запроса", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    expect(await verifyTurnstile("tok", "1.2.3.4")).toBe("ok");
    expect(spy).not.toHaveBeenCalled();
  });
});
