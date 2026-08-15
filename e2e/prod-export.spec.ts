import { test, expect } from "@playwright/test";

const DKP_FIELDS: Record<string, string> = {
  city: "Москва",
  date: "2026-08-15",
  contract_price: "1500000",
  seller_fio: "Иванов Иван Иванович",
  seller_address: "г. Москва, ул. Ленина, д. 1",
  buyer_fio: "Петров Пётр Петрович",
  buyer_address: "г. Москва, ул. Пушкина, д. 2",
  car_brand: "Toyota Camry",
  car_year: "2021",
  car_vin: "JTNBE3BK203456789",
  car_plate: "А123ВС777",
  car_sts: "99 12 345678",
};

const ACT_FIELDS: Record<string, string> = {
  city: "Москва",
  date: "2026-08-15",
  dkp_date: "2026-08-15",
  seller_fio: "Иванов Иван Иванович",
  buyer_fio: "Петров Пётр Петрович",
  car_brand: "Toyota Camry",
  car_year: "2021",
  car_vin: "JTNBE3BK203456789",
  car_plate: "А123ВС777",
  car_keys_qty: "2",
};

async function downloadPdf(page: import("@playwright/test").Page, template: string, fields: Record<string, string>, out: string) {
  await page.goto(`/builder?template=${template}`);
  await page.getByRole("button", { name: "Принять" }).click().catch(() => {});
  const prev = page.getByRole("button", { name: "Предпросмотр документа" });
  await prev.waitFor({ state: "visible", timeout: 300000 });
  for (const [id, value] of Object.entries(fields)) {
    const el = page.locator(`#${id}`);
    if (await el.count()) await el.fill(value);
  }
  await page.getByRole("button", { name: "Предпросмотр документа" }).click();
  await page.getByRole("button", { name: "Скачать" }).waitFor({ state: "visible", timeout: 300000 });
  await page.getByRole("button", { name: "Скачать" }).hover();
  await page.getByRole("button", { name: "Скачать PDF" }).waitFor({ state: "visible", timeout: 30000 });
  const dl = page.waitForEvent("download", { timeout: 180000 });
  await page.getByRole("button", { name: "Скачать PDF" }).click();
  const download = await dl;
  await download.saveAs(process.env.LOCALAPPDATA + "\\Temp\\opencode\\" + out);
  console.log("saved " + out);
}

test("prod dkp-auto pdf", async ({ page }) => {
  await downloadPdf(page, "dkp-auto", DKP_FIELDS, "prod-dkp.pdf");
  expect(true).toBeTruthy();
});

test("prod act-transfer-auto pdf", async ({ page }) => {
  await downloadPdf(page, "act-transfer-auto", ACT_FIELDS, "prod-act.pdf");
  expect(true).toBeTruthy();
});