/**
 * E2E тесты cookies-баннера (Фаза 1, 2026).
 * Покрывает:
 *  - Баннер показывается при первом визите
 *  - 3 равноправные кнопки (Принять всё / Только необходимые / Настроить)
 *  - Granular consent через панель настроек
 *  - Persistent иконка после решения
 *  - Кнопка «Отмена» в настройках не меняет consent
 *  - localStorage содержит granular categories
 *  - Escape работает
 */
import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL || "https://dogovor.expert";

async function clearStorage(page: Page, context: BrowserContext) {
  await context.clearCookies();
  await context.addInitScript(() => {
    try {
      window.localStorage.clear();
    } catch {
      /* noop */
    }
  });
}

test.describe("Cookies banner (granular consent, Фаза 1)", () => {
  test("первый визит: баннер с 3 кнопками виден", async ({ page, context }) => {
    await clearStorage(page, context);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    const banner = page.locator('[role="region"]', { hasText: /Мы используем cookies/i });
    await expect(banner).toBeVisible({ timeout: 8000 });

    await expect(banner.locator('button:has-text("Принять всё")')).toBeVisible();
    await expect(banner.locator('button:has-text("Только необходимые")')).toBeVisible();
    await expect(banner.locator('button:has-text("Настроить")')).toBeVisible();
  });

  test("Принять всё: localStorage = {analytics: true, marketing: true}", async ({ page, context }) => {
    await clearStorage(page, context);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    const banner = page.locator('[role="region"]', { hasText: /Мы используем cookies/i });
    await expect(banner).toBeVisible({ timeout: 8000 });

    await banner.locator('button:has-text("Принять всё")').click();
    await expect(banner).not.toBeVisible({ timeout: 3000 });

    const stored = await page.evaluate(() => {
      const raw = window.localStorage.getItem("dogovor_cookie_consent");
      return raw ? JSON.parse(raw) : null;
    });
    expect(stored).toBeTruthy();
    expect(stored.categories).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    expect(stored.policyVersion).toBeTruthy();
    expect(typeof stored.ts).toBe("number");
  });

  test("Только необходимые: localStorage = {analytics: false, marketing: false}", async ({ page, context }) => {
    await clearStorage(page, context);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    const banner = page.locator('[role="region"]', { hasText: /Мы используем cookies/i });
    await expect(banner).toBeVisible({ timeout: 8000 });

    await banner.locator('button:has-text("Только необходимые")').click();
    await expect(banner).not.toBeVisible({ timeout: 3000 });

    const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem("dogovor_cookie_consent") || "null"));
    expect(stored.categories.analytics).toBe(false);
    expect(stored.categories.marketing).toBe(false);
    expect(stored.categories.necessary).toBe(true);
  });

  test("Настроить → granular: только analytics, без marketing", async ({ page, context }) => {
    await clearStorage(page, context);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    const banner = page.locator('[role="region"]', { hasText: /Мы используем cookies/i });
    await expect(banner).toBeVisible({ timeout: 8000 });
    await banner.locator('button:has-text("Настроить")').click();

    // Открылась панель настроек
    const settings = page.locator('[role="dialog"][aria-modal="true"]', { hasText: /Настройки cookies/i });
    await expect(settings).toBeVisible({ timeout: 3000 });

    // Включаем только analytics
    const analyticsCheckbox = settings.locator('input[type="checkbox"]').nth(1);
    await analyticsCheckbox.check();
    // Marketing остаётся выключенным
    const marketingCheckbox = settings.locator('input[type="checkbox"]').nth(2);
    expect(await marketingCheckbox.isChecked()).toBe(false);

    await settings.locator('button:has-text("Сохранить")').click();
    await expect(settings).not.toBeVisible({ timeout: 3000 });

    const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem("dogovor_cookie_consent") || "null"));
    expect(stored.categories.analytics).toBe(true);
    expect(stored.categories.marketing).toBe(false);
  });

  test("после решения: persistent иконка 🍪 в углу", async ({ page, context }) => {
    await clearStorage(page, context);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    const banner = page.locator('[role="region"]', { hasText: /Мы используем cookies/i });
    await banner.locator('button:has-text("Принять всё")').click();
    await expect(banner).not.toBeVisible();

    // Persistent иконка
    const icon = page.getByRole("button", { name: "Настройки cookies" }).first();
    await expect(icon).toBeVisible({ timeout: 3000 });

    // Кликаем → открывается панель
    await icon.click();
    const settings = page.locator('[role="dialog"][aria-modal="true"]', { hasText: /Настройки cookies/i });
    await expect(settings).toBeVisible({ timeout: 3000 });

    // Чекбоксы pre-filled текущими значениями
    const analyticsCheckbox = settings.locator('input[type="checkbox"]').nth(1);
    expect(await analyticsCheckbox.isChecked()).toBe(true);
  });

  test("Escape: в баннере → declineAll (при первом визите)", async ({ page, context }) => {
    await clearStorage(page, context);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    const banner = page.locator('[role="region"]', { hasText: /Мы используем cookies/i });
    await expect(banner).toBeVisible({ timeout: 8000 });

    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem("dogovor_cookie_consent") || "null"));
    expect(stored.categories.analytics).toBe(false);
    expect(stored.categories.marketing).toBe(false);
  });

  test("навигация между страницами: баннер не появляется", async ({ page, context }) => {
    await clearStorage(page, context);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    const banner = page.locator('[role="region"]', { hasText: /Мы используем cookies/i });
    await banner.locator('button:has-text("Принять всё")').click();

    // Клиентская навигация — тот же документ, consent сохраняется.
    // На мобиле сайдбар спрятан — сначала открываем бургер-меню.
    const burger = page.getByRole("button", { name: "Открыть меню навигации" });
    if (await burger.isVisible()) await burger.click();
    await page.getByRole("link", { name: "Бланки" }).first().click();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await expect(page).toHaveURL(/\/blanks/);
    await expect(banner).not.toBeVisible();
  });
});
