import { test, expect } from "@playwright/test";

/**
 * Регрессия: страница не должна прокручиваться по горизонтали.
 *
 * Контекст (28.09.2026): на /resume при 390px документ имел scrollWidth 638
 * против clientWidth 390 — доступные 248px горизонтального скролла. Причина:
 * скрытый `<input type="file" class="sr-only">` внутри `.rvb-fld` получал
 * `width:100%` из `builderCss.ts` (инлайновый `<style>` вне @layer сильнее
 * Tailwind-утилиты `.sr-only`) и раздувал документ до 390px в ширину.
 *
 * Проверяем именно достижимый скролл (scrollingElement.scrollLeft), а не только
 * scrollWidth: off-canvas элементы в position:fixed могут давать scrollWidth,
 * не создавая прокрутки, и наоборот.
 */

const PAGES = [
  "/",
  "/resume",
  "/converter",
  "/blanks",
  "/ai-yurist",
  "/templates",
];

const WIDTHS = [360, 390, 768];

test.describe("Нет горизонтального скролла", () => {
  test.setTimeout(300_000);

  for (const path of PAGES) {
    for (const width of WIDTHS) {
      test(`${path} @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(800);

        const result = await page.evaluate(() => {
          const se = document.scrollingElement!;
          const de = document.documentElement;
          se.scrollLeft = 0;
          se.scrollLeft = 99_999; // максимальный достижимый сдвиг
          const reachable = se.scrollLeft;
          se.scrollLeft = 0;
          return {
            reachable,
            scrollWidth: de.scrollWidth,
            clientWidth: de.clientWidth,
          };
        });

        expect(
          result.reachable,
          `${path} @${width}px прокручивается по X на ${result.reachable}px ` +
            `(scrollWidth=${result.scrollWidth}, clientWidth=${result.clientWidth})`,
        ).toBe(0);
      });
    }
  }
});
