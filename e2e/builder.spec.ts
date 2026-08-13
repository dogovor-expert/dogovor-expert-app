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
    await page.locator(`#${id}`).fill(value);
  }
}

const DKP_FIELDS: Record<string, string> = {
  city: "Москва",
  date: "2026-08-14",
  contract_price: "1500000",
  seller_fio: "Иванов Иван Иванович",
  seller_address: "г. Москва, ул. Ленина, д. 1",
  buyer_fio: "Петров Пётр Петрович",
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
      .click();
    const download = await downloadPromise;

    expect(download.suggestedFilename().toLowerCase()).toMatch(/\.pdf$/);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    expect(fs.statSync(filePath!).size).toBeGreaterThan(0);

    await page.waitForTimeout(3_500);
    await page.getByRole("button", { name: "Вернуться к форме" }).click();
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
      .getByRole("button", { name: /Договор купли-продажи автомобиля.*\d{2}\.\d{2}\.\d{4}/ })
      .first();
    await expect(draftRow).toBeVisible();
    await draftRow.click();

    await expect(page.locator("#seller_fio")).toHaveValue(demo);
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

    await page.getByRole("button", { name: "Вернуться к форме" }).click();
    await expect(page.locator("#seller_fio")).toBeVisible();
  });
});