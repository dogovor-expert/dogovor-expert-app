import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { smartcaptchaConfigured, verifySmartCaptcha } from "@/lib/smartcaptcha";

const SECRET = "ysc2-test-secret";

describe("smartcaptchaConfigured", () => {
  const saved = process.env.SMARTCAPTCHA_SECRET_KEY;
  afterEach(() => {
    if (saved === undefined) delete process.env.SMARTCAPTCHA_SECRET_KEY;
    else process.env.SMARTCAPTCHA_SECRET_KEY = saved;
  });

  it("без секрета → false", () => {
    delete process.env.SMARTCAPTCHA_SECRET_KEY;
    expect(smartcaptchaConfigured()).toBe(false);
  });

  it("с секретом → true", () => {
    process.env.SMARTCAPTCHA_SECRET_KEY = SECRET;
    expect(smartcaptchaConfigured()).toBe(true);
  });
});

describe("verifySmartCaptcha", () => {
  const saved = process.env.SMARTCAPTCHA_SECRET_KEY;
  beforeEach(() => {
    process.env.SMARTCAPTCHA_SECRET_KEY = SECRET;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    if (saved === undefined) delete process.env.SMARTCAPTCHA_SECRET_KEY;
    else process.env.SMARTCAPTCHA_SECRET_KEY = saved;
  });

  it("status:ok → ok", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ status: "ok", host: "test.dogovor.expert" }), { status: 200 })
    ));
    expect(await verifySmartCaptcha("tok", "1.2.3.4")).toBe("ok");
  });

  it("status:failed → fail", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ status: "failed", message: "Invalid or expired Token." }), { status: 200 })
    ));
    expect(await verifySmartCaptcha("tok", "1.2.3.4")).toBe("fail");
  });

  it("не-2xx от сервиса → unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 503 })));
    expect(await verifySmartCaptcha("tok", "1.2.3.4")).toBe("unavailable");
  });

  it("сетевой бросок → unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));
    expect(await verifySmartCaptcha("tok", "1.2.3.4")).toBe("unavailable");
  });

  it("без секрета → ok и без запроса", async () => {
    delete process.env.SMARTCAPTCHA_SECRET_KEY;
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    expect(await verifySmartCaptcha("tok", "1.2.3.4")).toBe("ok");
    expect(spy).not.toHaveBeenCalled();
  });
});
