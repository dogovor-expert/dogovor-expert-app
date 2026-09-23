import { describe, expect, it } from "vitest";
import { resolveInitialTheme } from "@/lib/hooks/useBuilderTheme";

describe("resolveInitialTheme", () => {
  it("сохранённое значение важнее системной темы", () => {
    expect(resolveInitialTheme("sepia", true)).toBe("sepia");
    expect(resolveInitialTheme("sepia", false)).toBe("sepia");
    expect(resolveInitialTheme("light", true)).toBe("light");
    expect(resolveInitialTheme("dark", false)).toBe("dark");
  });

  it("без сохранённого — системная тема (dark → dark)", () => {
    expect(resolveInitialTheme(null, true)).toBe("dark");
  });

  it("без сохранённого и без системной тёмной — светлая", () => {
    expect(resolveInitialTheme(null, false)).toBe("light");
    expect(resolveInitialTheme("", false)).toBe("light");
  });

  it("мусор в хранилище игнорируется", () => {
    expect(resolveInitialTheme("midnight", true)).toBe("dark");
    expect(resolveInitialTheme("midnight", false)).toBe("light");
    expect(resolveInitialTheme("DARK", false)).toBe("light");
  });
});
