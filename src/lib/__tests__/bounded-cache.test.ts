import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { boundedCacheSet } from "@/lib/bounded-cache";

describe("boundedCacheSet", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("хранит и отдаёт записи", () => {
    const cache = new Map<string, { ts: number; body: string }>();
    boundedCacheSet(cache, "a", { ts: Date.now(), body: "1" }, 60_000);
    expect(cache.get("a")?.body).toBe("1");
  });

  it("выселяет старейшие записи при превышении предела", () => {
    const cache = new Map<number, { ts: number; v: number }>();
    for (let i = 0; i < 520; i++) {
      boundedCacheSet(cache, i, { ts: Date.now(), v: i }, 60_000);
    }
    expect(cache.size).toBeLessThanOrEqual(500);
    expect(cache.has(0)).toBe(false);
    expect(cache.has(519)).toBe(true);
  });

  it("ленивый свип удаляет протухшие записи", () => {
    vi.useFakeTimers();
    const cache = new Map<string, { ts: number; v: string }>();
    boundedCacheSet(cache, "old", { ts: Date.now(), v: "x" }, 60_000);
    vi.advanceTimersByTime(61_000);
    boundedCacheSet(cache, "new", { ts: Date.now(), v: "y" }, 60_000);
    expect(cache.has("old")).toBe(false);
    expect(cache.has("new")).toBe(true);
  });
});
