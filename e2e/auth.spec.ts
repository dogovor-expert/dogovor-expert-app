import { test, expect } from "@playwright/test";

test.describe("Auth pages: восстановление пароля и OAuth-кнопки", () => {
  test("login: кнопки Google и Яндекс видны, ссылка на восстановление пароля работает", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("button", { name: /Google/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Яндекс/ })
    ).toBeVisible();

    // Переключаемся на вход по паролю
    await page.getByRole("button", { name: /У меня уже есть аккаунт/ }).click();
    // Вводим email и переходим к шагу пароля
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.getByRole("button", { name: /Продолжить/ }).click();
    // На шаге пароля доступна ссылка восстановления
    await page.getByRole("link", { name: /Забыли пароль\?/ }).click();
    await expect(page).toHaveURL(/\/login\/forgot/);
  });

  test("login: при неудачном OAuth показывается ошибка через ?error=oauth", async ({
    page,
  }) => {
    await page.goto("/login?error=oauth&next=%2Fdashboard");

    await expect(
      page.getByText(/Не удалось войти через выбранный сервис/)
    ).toBeVisible();
  });

  test("login/forgot: форма отправки ссылки для сброса", async ({ page }) => {
    await page.goto("/login/forgot");

    await expect(
      page.getByRole("heading", { name: "Восстановление пароля" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Отправить ссылку для сброса/ })
    ).toBeVisible();

    await page.locator('input[type="email"]').fill("test@example.com");
    await page
      .getByRole("button", { name: /Отправить ссылку для сброса/ })
      .click();
    await expect(
      page.getByText(/Ссылка для сброса пароля отправлена/)
    ).toBeVisible();
  });

  test("login/reset: страница смены пароля доступна и требует сессию", async ({
    page,
  }) => {
    await page.goto("/login/reset");

    await expect(
      page.getByRole("heading", { name: "Новый пароль" })
    ).toBeVisible();
    await expect(
      page.getByText(/Ссылка недействительна или истекла/)
    ).toBeVisible();
  });
});