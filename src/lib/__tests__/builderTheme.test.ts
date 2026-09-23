import { describe, expect, it } from "vitest";
import { BUILDER_THEMES, resolveInitialTheme } from "@/lib/hooks/useBuilderTheme";

describe("resolveInitialTheme", () => {
  it("все темы каталога применяются", () => {
    for (const t of BUILDER_THEMES) {
      expect(resolveInitialTheme(t.id)).toBe(t.id);
    }
  });

  it("всё остальное — светлая (старый dark мигрирует в light)", () => {
    expect(resolveInitialTheme("light")).toBe("light");
    expect(resolveInitialTheme("dark")).toBe("light");
    expect(resolveInitialTheme(null)).toBe("light");
    expect(resolveInitialTheme("")).toBe("light");
  });

  it("мусор в хранилище игнорируется", () => {
    expect(resolveInitialTheme("midnight")).toBe("light");
    expect(resolveInitialTheme("SEPIA")).toBe("light");
  });

  it("каталог — только светлые темы, без dark", () => {
    expect(BUILDER_THEMES.length).toBeGreaterThanOrEqual(2);
    expect(BUILDER_THEMES.some((t) => t.id === "dark")).toBe(false);
    for (const t of BUILDER_THEMES) {
      expect(t.swatch).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
