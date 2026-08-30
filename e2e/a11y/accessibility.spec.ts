import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { name: "Главная", path: "/" },
  { name: "Каталог шаблонов", path: "/templates" },
  { name: "Билдер (форма)", path: "/builder?template=dkp-auto-short" },
  { name: "Сканер документов", path: "/builder?template=dkp-auto-short" },
  { name: "Вход / регистрация", path: "/login" },
  { name: "Конвертер", path: "/converter" },
  { name: "Калькуляторы", path: "/utils" },
  { name: "Автоподбор (VIN)", path: "/autoteka" },
  { name: "ОСАГО", path: "/osago" },
  { name: "Техосмотр", path: "/techosmotr" },
  { name: "Тахограф", path: "/tahograph" },
  { name: "Обратная связь", path: "/contacts" },
];

for (const p of PAGES) {
  test.describe(`A11y: ${p.name}`, () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test(`WCAG 2.2 AA — ${p.name}`, async ({ page }) => {
      await page.goto(p.path);
      await page.waitForLoadState("networkidle");

      if (p.path.includes("/builder")) {
        await page.waitForSelector('[data-field]', { timeout: 10_000 }).catch(() => {});
      }

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test(`WCAG 2.2 AA (mobile 360px) — ${p.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 });
      await page.goto(p.path);
      await page.waitForLoadState("networkidle");

      if (p.path.includes("/builder")) {
        await page.waitForSelector('[data-field]', { timeout: 10_000 }).catch(() => {});
      }

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  });
}