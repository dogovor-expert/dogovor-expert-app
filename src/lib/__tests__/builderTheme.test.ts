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

  it("каталог — все 6 гамм образца + светлая и песок; удалённые мигрируют в light", () => {
    expect(BUILDER_THEMES.map((t) => t.id)).toEqual([
      "light",
      "primer",
      "warmgray",
      "solar",
      "sepia",
      "kindle",
      "milktea",
      "sand",
    ]);
    for (const t of BUILDER_THEMES) {
      expect(t.swatch).toMatch(/^#[0-9a-f]{6}$/i);
    }
    // удалённые темы ведут себя как мусор — светлая
    for (const gone of ["gruvbox", "clay", "umber", "bark", "dark"]) {
      expect(resolveInitialTheme(gone)).toBe("light");
    }
  });
});
