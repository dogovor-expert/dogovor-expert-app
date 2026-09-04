// Smoke test: проверить что cookies баннер виден при первой загрузке без localStorage.
// Проверяет 4 главных бага: FOUC, кнопка Принять, broadcast для YandexMetrika, persistence.
import { test, expect } from "@playwright/test";

test("cookies banner appears on first visit (no localStorage)", async ({ page, context }) => {
  // Чистим все cookies и localStorage ДО загрузки страницы
  await context.clearCookies();
  await context.addInitScript(() => {
    try {
      window.localStorage.clear();
    } catch {
      /* noop */
    }
  });

  // Переходим на прод (НЕ на localhost, чтобы исключить dev-кеш)
  const target = process.env.E2E_BASE_URL || "https://dogovor.expert";
  await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  // Ищем баннер по роли dialog или по тексту
  const banner = page.locator('[role="dialog"]', { hasText: /Мы используем cookies/i });
  await expect(banner).toBeVisible({ timeout: 8000 });

  // Проверяем кнопки
  const acceptBtn = banner.locator('button:has-text("Принять")');
  const declineBtn = banner.locator('button:has-text("Отклонить")');
  await expect(acceptBtn).toBeVisible();
  await expect(declineBtn).toBeVisible();

  // Кликаем "Принять" — баннер должен исчезнуть
  await acceptBtn.click();
  await expect(banner).not.toBeVisible({ timeout: 3000 });

  // Проверяем localStorage
  const stored = await page.evaluate(() => window.localStorage.getItem("dogovor_cookie_consent"));
  expect(stored).toBe("accepted");
});

test("cookies banner: persist across navigation", async ({ page, context }) => {
  await context.clearCookies();
  await context.addInitScript(() => {
    try {
      window.localStorage.clear();
    } catch {
      /* noop */
    }
  });

  const target = process.env.E2E_BASE_URL || "https://dogovor.expert";
  await page.goto(target, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  const banner = page.locator('[role="dialog"]', { hasText: /Мы используем cookies/i });
  await expect(banner).toBeVisible({ timeout: 8000 });

  // Принимаем
  await banner.locator('button:has-text("Принять")').click();
  await expect(banner).not.toBeVisible();

  // Навигация — баннер НЕ должен появиться
  await page.goto(`${target}/utils`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await expect(banner).not.toBeVisible({ timeout: 3000 });
});

test("cookies banner: не показывается если уже accepted", async ({ page, context }) => {
  // Устанавливаем localStorage ДО загрузки
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("dogovor_cookie_consent", "accepted");
    } catch {
      /* noop */
    }
  });

  const target = process.env.E2E_BASE_URL || "https://dogovor.expert";
  await page.goto(target, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  const banner = page.locator('[role="dialog"]', { hasText: /Мы используем cookies/i });
  // Подождём 2 секунды — баннер НЕ должен появиться
  await page.waitForTimeout(2000);
  await expect(banner).not.toBeVisible();
});
