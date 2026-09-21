/**
 * SMOKE-тесты: 5 базовых сценариев жизнеспособности сайта.
 * Эти тесты НЕ покрывают бизнес-логику, а только проверяют, что сайт
 * вообще работает после правок. Падение = изменения нельзя деплоить.
 *
 * 1. Главная страница: 200, title, h1
 * 2. Каталог шаблонов: 200, ≥N карточек
 * 3. Конструктор: 200, форма загружается
 * 4. 404: статус 404
 * 5. Cookie consent: баннер виден, выбор сохраняется
 */
import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL || "http://localhost:3100";

test.describe("Smoke — критические пути", () => {
  test("1. Главная: 200 + title + h1", async ({ page }) => {
    const res = await page.goto(BASE);
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/Dogovor|документ/i);
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
  });

  test("2. Каталог /templates: 200 + список", async ({ page }) => {
    const res = await page.goto(`${BASE}/templates`);
    expect(res?.status()).toBeLessThan(400);
    // На странице должен быть хотя бы один заголовок/ссылка на шаблон
    const cards = page.locator("a[href^='/documents/']");
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("3. Конструктор /builder: 200, форма", async ({ page }) => {
    const res = await page.goto(`${BASE}/builder`);
    expect(res?.status()).toBeLessThan(400);
    // Любая форма или инпут (может быть внутри client-only компонента)
    await page.waitForTimeout(1500);
    const fieldCount =
      (await page.locator("form").count()) +
      (await page.locator("input,button").count());
    expect(fieldCount).toBeGreaterThan(0);
  });

  test("4. 404: статус 404 на /this-page-does-not-exist", async ({ page }) => {
    const res = await page.goto(`${BASE}/this-page-does-not-exist-${Date.now()}`);
    expect(res?.status()).toBe(404);
  });

  test("5. Cookie consent: баннер появляется, localStorage сохраняется", async ({
    page,
  }) => {
    await page.goto(BASE);
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch {
        /* noop */
      }
    });
    await page.reload();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const banner = page.locator('[role="region"]', { hasText: /Мы используем cookies/i });
    await expect(banner).toBeVisible({ timeout: 8000 });

    const accept = banner.locator("button:has-text('Принять')").first();
    await accept.click();
    await page.waitForTimeout(1500);

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("dogovor_cookie_consent") || "null"),
    );
    expect(stored).toBeTruthy();
    expect(stored.categories).toBeTruthy();
  });
});
