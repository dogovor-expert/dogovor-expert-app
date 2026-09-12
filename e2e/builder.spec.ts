import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

const DKP_URL = "/builder?template=dkp-auto";
const GIBDD_URL = "/builder?template=gibdd-reg-app";

async function acceptCookies(page: Page) {
  const accept = page.getByRole("button", { name: "Принять" });
  if (await accept.isVisible().catch(() => false)) {
    await accept.click();
  }
}

async function waitPreviewButton(page: Page) {
  const btn = page.getByRole("button", { name: "Предпросмотр документа" });
  await btn.waitFor({ state: "visible", timeout: 60_000 });
}

async function gotoDkp(page: Page) {
  await page.goto(DKP_URL);
  await acceptCookies(page);
  try {
    await waitPreviewButton(page);
  } catch {
    await page
      .getByRole("button", { name: /Договор купли-продажи автомобиля \(ДКП\)/ })
      .first()
      .click();
    await waitPreviewButton(page);
  }
  await page.waitForTimeout(3_000);
}

async function gotoGibdd(page: Page) {
  await page.goto(GIBDD_URL);
  await acceptCookies(page);
  try {
    await waitPreviewButton(page);
  } catch {
    await page.getByRole("button", { name: "Заявление на регистрацию ТС" }).click();
    await waitPreviewButton(page);
  }
  await page.waitForTimeout(3_000);
}

async function fillFields(page: Page, fields: Record<string, string>) {
  for (const [id, value] of Object.entries(fields)) {
    const loc = page.locator(`#${id}`);
    if (await loc.count() === 0) continue; // поле есть не во всех версиях шаблона
    await loc.fill(value);
  }
}

const DKP_FIELDS: Record<string, string> = {
  city: "Москва",
  date: "2026-08-14",
  contract_price: "1500000",
  seller_fio: "Иванов Иван Иванович",
  seller_passport: "4512 123456",
  seller_passport_issued: "ОВД г. Москвы",
  seller_address: "г. Москва, ул. Ленина, д. 1",
  buyer_fio: "Петров Пётр Петрович",
  buyer_passport: "4615 987654",
  buyer_passport_issued: "ОВД г. Москвы",
  buyer_address: "г. Москва, ул. Пушкина, д. 2",
  car_brand: "Toyota Camry",
  car_year: "2021",
  car_vin: "JTNBE3BK203456789",
  car_sts: "99 12 345678",
};

const GIBDD_FIELDS: Record<string, string> = {
  date: "2026-08-14",
  gibdd_department: "МОТНРЭР №1 ГИБДД г. Москвы",
  applicant_fio: "Иванов Иван Иванович",
  owner_passport_series: "4610",
  owner_passport_number: "123456",
  owner_address: "г. Москва, ул. Ленина, д. 1",
  owner_phone: "+7 (900) 123-45-67",
  car_make: "Toyota Camry",
};

test.describe("E1: ДКП → предпросмотр → скачать PDF", () => {
  test("полный сценарий с экспортом", async ({ page }) => {
    await gotoDkp(page);

    const sellerFio = page.locator("#seller_fio");
    await expect(sellerFio).toBeVisible();
    await sellerFio.fill("Иванов Иван Иванович");
    await expect(sellerFio).toHaveValue("Иванов Иван Иванович");

    await fillFields(page, DKP_FIELDS);

    await page.getByRole("button", { name: "Предпросмотр документа" }).click();
    await expect(
      page.getByRole("heading", { name: "Предварительный просмотр" })
    ).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Скачать", exact: true })
      .click(); // открывает меню экспорта
    await page.getByRole("button", { name: "Скачать PDF" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename().toLowerCase()).toMatch(/\.pdf$/);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    expect(fs.statSync(filePath).size).toBeGreaterThan(0);

    await page.waitForTimeout(3_500);
    await page.getByRole("button", { name: "Вернуться к форме" }).first().click();
    await expect(page.locator("#seller_fio")).toBeVisible();
  });
});

test.describe("E2: gibdd-reg-app (63 поля) — секции и предпросмотр", () => {
  test("все секции видны, предпросмотр открывается", async ({ page }) => {
    await gotoGibdd(page);

    await expect(
      page.getByRole("heading", { name: /Транспортное средство/ })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Владелец/ })).toBeVisible();
    await expect(page.getByText(/обязательных/).first()).toBeVisible();

    await fillFields(page, GIBDD_FIELDS);

    const fieldCount = await page.locator("input, select, textarea").count();
    expect(fieldCount).toBeGreaterThan(5);

    await page.getByRole("button", { name: "Предпросмотр документа" }).click();
    await expect(
      page.getByRole("heading", { name: "Предварительный просмотр" })
    ).toBeVisible();
  });
});

test.describe("E4: черновик сохраняется и восстанавливается после перезагрузки", () => {
  test("autosave + reload + открытие черновика", async ({ page }) => {
    await gotoDkp(page);

    const demo = "Тестов Тест Тестович";
    await page.locator("#seller_fio").fill(demo);
    await expect(page.locator("#seller_fio")).toHaveValue(demo);

    await page.waitForTimeout(2_500);

    await page.reload();
    await expect(page.locator("#seller_fio")).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "Документы и инструменты" }).click();
    const draftRow = page
      .getByRole("button", { name: /ДКП авто — Краткий.*\d{2}\.\d{2}\.\d{4}/ })
      .first();
    await expect(draftRow).toBeVisible();
    await draftRow.click();

    await expect(page.locator("#seller_fio")).toHaveValue(demo);
  });
});

test.describe("E6: DOCX-экспорт для free-пользователя = paywall", () => {
  test("клик DOCX показывает модалку PRO, PDF скачивается", async ({ page }) => {
    await gotoDkp(page);

    await fillFields(page, DKP_FIELDS);

    await page.getByRole("button", { name: "Предпросмотр документа" }).click();
    await expect(
      page.getByRole("heading", { name: "Предварительный просмотр" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Скачать", exact: true }).click();
    await page.getByRole("button", { name: "Скачать DOCX" }).click();
    await expect(
      page.getByRole("heading", { name: /DOCX.*PRO/ })
    ).toBeVisible();
    await page.getByRole("button", { name: "Пока нет" }).click();
    await expect(
      page.getByRole("heading", { name: /DOCX.*PRO/ })
    ).toHaveCount(0);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Скачать", exact: true }).click();
    await page.getByRole("button", { name: "Скачать PDF" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename().toLowerCase()).toMatch(/\.pdf$/);
  });
});

test.describe("E7: демо-подсказки вместо демо-значений", () => {
  test("text-поля пустые без демо-бейджа, select/checkbox предзаполнены", async ({
    page,
  }) => {
    await gotoDkp(page);
    // дефолт — Краткий; поля copies_count/адрес-совпадает есть в Полном
    await page.getByRole("button", { name: "Полный", exact: true }).first().click();
    await expect(page.locator("#seller_fio")).toHaveValue("");
    await expect(
      page.getByText("значение по умолчанию (образец)")
    ).toHaveCount(0);
    await expect(page.locator("#copies_count")).toHaveValue("3");

    const sameAddress = page
      .locator("label")
      .filter({ hasText: "Адрес проживания совпадает" })
      .locator("input");
    await expect(sameAddress).toBeChecked();
  });

  test("компактное склонение: видно после blur, скрыто при фокусе", async ({
    page,
  }) => {
    await gotoDkp(page);

    const fio = page.locator("#seller_fio");
    await fio.click();
    await fio.fill("Тестов Тест Тестович");
    await expect(page.getByText("Склонение:")).toHaveCount(0);

    await fio.blur();
    const hint = page.getByText("Род.: Тестова Теста Тестовича");
    await expect(hint).toBeVisible();
    await expect(
      page.getByText("Предл.: Тестове Тесте Тестовиче")
    ).toBeVisible();

    await fio.click();
    await expect(page.getByText("Склонение:")).toHaveCount(0);
  });

  test("клик по ошибке аудита скроллит и фокусирует поле", async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await gotoDkp(page);

    await page.getByRole("button", { name: "Проверить документ" }).click();
    const errorRow = page
      .getByRole("button")
      .filter({ hasText: /Город.*обязательно/ });
    await expect(errorRow).toBeVisible();
    await errorRow.click();

    await expect(page.locator("#city")).toBeFocused();
  });
});

test.describe("E5: мобильный viewport (360px) — форма и предпросмотр", () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test("форма в одну колонку, предпросмотр доступен", async ({ page }) => {
    await gotoDkp(page);

    const sellerFio = page.locator("#seller_fio");
    await expect(sellerFio).toBeVisible();
    await sellerFio.fill("Иванов Иван Иванович");

    await fillFields(page, DKP_FIELDS);

    await page.getByRole("button", { name: "Предпросмотр документа" }).click();
    await expect(
      page.getByRole("heading", { name: "Предварительный просмотр" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Вернуться к форме" }).first().click();
    await expect(page.locator("#seller_fio")).toBeVisible();
  });
});

test.describe("E8: переключатель Полный/Краткий ДКП", () => {
  test("переключение шаблона сохраняет значения", async ({ page }) => {
    await gotoDkp(page);

    await expect(
      page.getByRole("button", { name: "Полный", exact: true }).first()
    ).toBeVisible();

    // дефолт — Краткий; переходим в Полный и заполняем
    await page.getByRole("button", { name: "Полный", exact: true }).first().click();
    await page.locator("#seller_fio").fill("Иванов Иван Иванович");
    await page.locator("#city").fill("Москва");
    await page.locator("#contract_price").fill("1500000");
    await page.locator("#car_brand").fill("Toyota Camry");
    await page.locator("#car_vin").fill("JTNBE3BK203456789");
    await page.locator("#car_sts").fill("99 12 345678");

    await page.getByRole("button", { name: "Краткий (1 стр.)", exact: true }).first().click();
    await expect(page.locator("#car_vin")).toBeVisible();

    await page.getByRole("button", { name: "Полный", exact: true }).first().click();
    await expect(page.locator("#seller_fio")).toHaveValue("Иванов Иван Иванович");
    await expect(page.locator("#contract_price")).toHaveValue("1500000");
  });
});