import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

const FIX = path.join(process.env.LOCALAPPDATA || "", "Temp", "opencode", "audit-fixtures");
const OUT = path.join(process.cwd(), "test-results", "audit");
fs.mkdirSync(OUT, { recursive: true });

const SMALL_PDF = path.join(FIX, "small.pdf");
const SMALL_PNG = path.join(FIX, "small.png");
const BIG_PDF = path.join(FIX, "big.pdf");
const BIG_PNG = path.join(FIX, "big.png");
const BIG_DOCX = path.join(FIX, "big.docx");

type Box = { console: string[]; pageErr: string[]; failed: string[]; bad: string[] };

function track(page: Page): Box {
  const box: Box = { console: [], pageErr: [], failed: [], bad: [] };
  page.on("console", (m) => {
    const t = m.type();
    if (t === "error" || t === "warning") box.console.push(`[${t}] ${m.text()}`);
  });
  page.on("pageerror", (e) => box.pageErr.push(e.message));
  page.on("requestfailed", (r) =>
    box.failed.push(`${new URL(r.url()).pathname} :: ${r.failure()?.errorText || ""}`)
  );
  page.on("response", (r) => {
    if (r.status() >= 400) box.bad.push(`${r.status()} ${r.url()}`);
  });
  return box;
}

async function acceptCookies(page: Page) {
  try {
    const b = page.getByRole("button", { name: "Принять" });
    if (await b.isVisible({ timeout: 3000 }).catch(() => false)) await b.click({ timeout: 5000 });
  } catch {}
}

async function nav(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await acceptCookies(page);
}

async function shots(page: Page, name: string) {
  await page.setViewportSize({ width: 360, height: 700 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `${name}-360.png`), fullPage: false }).catch(() => {});
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `${name}-1440.png`), fullPage: false }).catch(() => {});
}

async function clickBtn(page: Page, re: RegExp): Promise<boolean> {
  const btns = page.getByRole("button").filter({ hasText: re });
  try {
    const n = await btns.count();
    if (n === 0) return false;
    await btns.first().click({ timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

async function isVisible(page: Page, re: RegExp, ms = 8000): Promise<boolean> {
  try {
    const loc = page.getByText(re).first();
    await loc.waitFor({ state: "visible", timeout: ms });
    return true;
  } catch {
    return false;
  }
}

function report(name: string, box: Box, extra: string[]) {
  console.log(`\n===== SCENARIO ${name} =====`);
  if (box.pageErr.length) console.log("  pageerror:", [...new Set(box.pageErr)]);
  if (box.console.length) console.log("  console:", [...new Set(box.console)]);
  if (box.failed.length) console.log("  failed:", [...new Set(box.failed)]);
  if (box.bad.length) console.log("  badHttp:", [...new Set(box.bad)].slice(0, 15));
  for (const e of extra) console.log("  " + e);
  console.log(`===== END ${name} =====`);
}

test.describe("dogovor.expert audit", () => {
  test("01-главная: счётчик 369 и логотип", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/");
    extra.push(`counter369: ${await isVisible(page, /369 шаблонов/)}`);
    extra.push(`logo: ${await isVisible(page, /Dogovor/i, 3000)}`);
    await shots(page, "01-home");
    report("01-home", box, extra);
  });

  test("02-templates: поиск и фильтр", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/templates");
    const search = page.getByPlaceholder("Поиск шаблонов...");
    await search.waitFor({ timeout: 20000 });
    await search.fill("купли-продажи предприятия");
    extra.push(`search-enterprise: ${await isVisible(page, /Договор купли-продажи предприятия/)}`);
    await search.fill("стажёром");
    extra.push(`search-intern: ${await isVisible(page, /Договор со стажёром/)}`);
    await search.fill("");
    const catOk = await clickBtn(page, /^Бизнес$/).catch(() => false);
    extra.push(`cat-business-click: ${catOk}`);
    await page.waitForTimeout(1200);
    extra.push(`cat-business-shows-enterprise: ${await isVisible(page, /Купли-продажи предприятия/i)}`);
    await shots(page, "02-templates");
    report("02-templates", box, extra);
  });

  test("03-builder: заполнение, предпросмотр, экспорт PDF+DOCX", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/builder?template=dkp-auto");
    await page.waitForSelector('[data-field]', { timeout: 30000 });
    await page.locator("#city").fill("Москва");
    await page.locator("#contract_price").fill("1250000");
    extra.push("form-filled");
    const preview = await clickBtn(page, /Предпросмотр документа/);
    extra.push(`preview-click: ${preview}`);
    const pdfBtn = page.getByText("Скачать PDF").first();
    try {
      await pdfBtn.waitFor({ state: "visible", timeout: 30000 });
      const [dl] = await Promise.all([
        page.waitForEvent("download", { timeout: 60000 }),
        pdfBtn.click(),
      ]);
      const p = path.join(OUT, "03-dkp.pdf");
      await dl.saveAs(p);
      extra.push(`pdf-download: ${dl.suggestedFilename()} ${fs.statSync(p).size} B`);
    } catch (e) {
      extra.push(`pdf-download: FAIL ${(e as Error).message.slice(0, 80)}`);
    }
    const docxBtn = page.getByText("Скачать DOCX").first();
    try {
      await docxBtn.waitFor({ state: "visible", timeout: 30000 });
      const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 60000 }), docxBtn.click()]);
      const p = path.join(OUT, "03-dkp.docx");
      await dl.saveAs(p);
      extra.push(`docx-download: ${dl.suggestedFilename()} ${fs.statSync(p).size} B`);
    } catch {
      extra.push("docx-download: not-available");
    }
    await shots(page, "03-builder");
    report("03-builder", box, extra);
  });

  test("04-builder: переключение шаблона через селектор", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/builder");
    const sel = page.getByPlaceholder(/Найти шаблон/);
    await sel.waitFor({ timeout: 20000 });
    await sel.fill("аренда квартиры");
    await page.waitForTimeout(800);
    const card = page.getByText(/аренды квартиры/).first();
    const cardClicked = await card.isVisible({ timeout: 5000 }).catch(() => false);
    if (cardClicked) {
      await card.click();
      await page.waitForSelector('[data-field]', { timeout: 30000 });
    }
    extra.push(`template-card-click: ${cardClicked}`);
    extra.push(`url-after: ${page.url()}`);
    extra.push(`form-rendered: ${(await page.locator("[data-field]").count()) > 0}`);
    await shots(page, "04-builder-select");
    report("04-builder", box, extra);
  });

  test("05-builder: сканер для гостя (PRO-gate)", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/builder?template=dkp-auto");
    await page.waitForSelector('[data-field]', { timeout: 30000 });
    const btn = page.getByRole("button").filter({ hasText: /сканер|сканировать/i });
    let clicked = false;
    try {
      if ((await btn.count()) > 0) {
        await btn.first().click();
        clicked = true;
      }
    } catch {}
    extra.push(`scanner-btn-click: ${clicked}`);
    await page.waitForTimeout(2000);
    extra.push(`pro-upsell: ${await isVisible(page, /Pro|плюс|оплат/, 5000)}`);
    extra.push(`upsell-subscribed-state: ${(await page.getByText(/у вас уже есть Pro|подписка активна/i).count()) > 0}`);
    await shots(page, "05-scanner-gate");
    report("05-builder-scanner", box, extra);
  });

  test("06-login: режимы, OAuth, Turnstile iframe", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/login");
    extra.push(`default-title: ${await isVisible(page, /Регистрация в личном кабинете/)}`);
    extra.push(`google-btn: ${(await page.getByRole("button", { name: "Google" }).count()) > 0}`);
    extra.push(`yandex-btn: ${(await page.getByRole("button", { name: "Яндекс" }).count()) > 0}`);
    const google = page.getByRole("button", { name: "Google" }).first();
    try {
      await google.click({ timeout: 10000 });
      await page.waitForTimeout(3000);
      extra.push(`oauth-redirect-host: ${new URL(page.url()).host}`);
      if (new URL(page.url()).host !== "dogovor.expert") {
        await page.goBack().catch(() => {});
      }
    } catch (e) {
      extra.push(`oauth-click: FAIL ${(e as Error).message.slice(0, 60)}`);
    }
    if (new URL(page.url()).host === "dogovor.expert") {
      await page.goto("/login", { waitUntil: "domcontentloaded" });
    }
    await page.getByPlaceholder("you@example.com").fill("audit-check@example.com");
    await clickBtn(page, /Продолжить/);
    const pass = page.getByPlaceholder("Минимум 8 символов");
    await pass.waitFor({ timeout: 15000 });
    await pass.fill("auditpass123");
    await page.getByPlaceholder("Повторите пароль").fill("auditpass123");
    await page.waitForTimeout(1500);
    extra.push(`turnstile-iframe: ${(await page.locator('iframe[src*="challenges.cloudflare.com"]').count()) > 0}`);
    await shots(page, "06-login");
    report("06-login", box, extra);
  });

  test("07-converter: merge успех", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/converter?tool=merge");
    await page.setInputFiles('input[type="file"]', [SMALL_PDF, SMALL_PDF], { timeout: 20000 });
    await page.waitForTimeout(800);
    extra.push(`merged-label: ${(await page.getByText(/Объединить \(2 файл/).count()) > 0}`);
    const dl = page.waitForEvent("download", { timeout: 60000 }).catch(() => null);
    await clickBtn(page, /Объединить/);
    const d = await dl;
    if (d) {
      const p = path.join(OUT, "07-merge.pdf");
      await d.saveAs(p);
      extra.push(`download: ${d.suggestedFilename()} ${fs.statSync(p).size} B`);
    } else extra.push("download: NONE");
    await shots(page, "07-merge");
    report("07-merge", box, extra);
  });

  test("08-converter: split успех", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/converter?tool=split");
    await page.setInputFiles('input[type="file"]', SMALL_PDF, { timeout: 20000 });
    await page.waitForSelector('input[placeholder*="1-3"]', { timeout: 15000 });
    await page.locator('input[placeholder*="1-3"]').fill("1");
    const dl = page.waitForEvent("download", { timeout: 60000 }).catch(() => null);
    await clickBtn(page, /Скачать выделенные страницы/);
    const d = await dl;
    if (d) {
      const p = path.join(OUT, "08-split.pdf");
      await d.saveAs(p);
      extra.push(`download: ${d.suggestedFilename()} ${fs.statSync(p).size} B`);
    } else extra.push("download: NONE");
    await shots(page, "08-split");
    report("08-split", box, extra);
  });

  test("09-converter: img2pdf успех", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/converter?tool=img2pdf");
    await page.setInputFiles('input[type="file"]', SMALL_PNG, { timeout: 20000 });
    await page.waitForTimeout(800);
    const dl = page.waitForEvent("download", { timeout: 60000 }).catch(() => null);
    await clickBtn(page, /Создать PDF/);
    const d = await dl;
    if (d) {
      const p = path.join(OUT, "09-img2pdf.pdf");
      await d.saveAs(p);
      extra.push(`download: ${d.suggestedFilename()} ${fs.statSync(p).size} B`);
    } else extra.push("download: NONE");
    await shots(page, "09-img2pdf");
    report("09-img2pdf", box, extra);
  });

  test("10-converter: pdf2img успех", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/converter?tool=pdf2img");
    await page.setInputFiles('input[type="file"]', SMALL_PDF, { timeout: 20000 });
    await page.waitForTimeout(1500);
    extra.push(`pages-info: ${(await page.getByText(/страниц/i).count()) > 0}`);
    const dl = page.waitForEvent("download", { timeout: 90000 }).catch(() => null);
    const okBtn = await (async () => {
      for (const re of [/Скачать.*JPG|JPG.*Скачать/i, /Конвертировать/i, /В JPG/i]) {
        if (await clickBtn(page, re)) return re.source;
      }
      return "";
    })();
    const d = await dl;
    if (d) {
      const p = path.join(OUT, "10-pdf2img.jpg");
      await d.saveAs(p);
      extra.push(`download: ${d.suggestedFilename()} ${fs.statSync(p).size} B [btn:${okBtn}]`);
    } else extra.push(`download: NONE [btn:${okBtn}]`);
    await shots(page, "10-pdf2img");
    report("10-pdf2img", box, extra);
  });

  test("11-converter: ocr распознавание", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/converter?tool=ocr");
    await page.setInputFiles('input[type="file"]', SMALL_PDF, { timeout: 20000 });
    await page.waitForTimeout(800);
    await clickBtn(page, /Распознать текст/);
    let text = "";
    try {
      await page.waitForFunction(() => {
        const t = document.querySelector<HTMLTextAreaElement>("textarea");
        return t !== null && t.value.trim().length > 0;
      }, undefined, { timeout: 120000 });
      text = await page.evaluate(() => document.querySelector("textarea")?.value ?? "");
    } catch {
      extra.push("ocr-result: TIMEOUT 120s");
    }
    extra.push(`ocr-result: "${text.trim().slice(0, 40)}"`);
    await shots(page, "11-ocr");
    report("11-ocr", box, extra);
  });

  test("12-converter: sign загрузка PDF + крипто-плагин", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/converter?tool=sign");
    await page.setInputFiles('input[type="file"]', SMALL_PDF, { timeout: 20000 });
    await page.waitForTimeout(2000);
    extra.push(`crypto-description: ${(await page.getByText(/КриптоПро/i).count()) > 0}`);
    extra.push(`plugin-block: ${(await page.getByText(/УКЭП|подпис/i).count()) > 0}`);
    await shots(page, "12-sign");
    report("12-sign", box, extra);
  });

  test("13-converter: >50МБ размерные проверки во всех 6", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    const checks: Array<[string, string]> = [
      ["merge", BIG_PDF],
      ["split", BIG_PDF],
      ["img2pdf", BIG_PNG],
      ["pdf2img", BIG_PDF],
      ["sign", BIG_PDF],
      ["docx", BIG_DOCX],
    ];
    for (const [tool, file] of checks) {
      await nav(page, `/converter?tool=${tool}`);
      try {
        await page.setInputFiles('input[type="file"]', file, { timeout: 30000 });
      } catch (e) {
        extra.push(`[${tool}] setInputFiles FAIL ${(e as Error).message.slice(0, 40)}`);
        continue;
      }
      const ok = await isVisible(page, /слишком большой/, 15000);
      extra.push(`[${tool}] too-big-msg: ${ok}`);
    }
    report("13-size-checks", box, extra);
  });

  test("14-utils: 6 калькуляторов", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/utils");
    const run = async (label: string, fillFirst = false) => {
      await clickBtn(page, new RegExp(label));
      await page.waitForTimeout(900);
      if (fillFirst) {
        const inp = page.locator("input[type=text],input[type=number]").first();
        if ((await inp.count()) > 0) {
          await inp.fill("10").catch(() => {});
          await page.waitForTimeout(400);
        }
      }
      extra.push(`${label}: panel=${(await page.getByText(new RegExp(label)).count()) > 0}`);
    };
    await run("НДС", true);
    await run("Госпошлина", true);
    await run("Алименты", true);
    const validClicked = await (async () => {
      for (const re of [/Проверка реквизитов/, /Проверить реквизиты/]) if (await clickBtn(page, re)) return re.source;
      return "";
    })();
    extra.push(`validators: [${validClicked}]`);
    if (validClicked) {
      await page.waitForTimeout(500);
      const inn = page.getByPlaceholder(/ИНН/).first() || page.locator("input").nth(0);
      await inn.fill("7707083893").catch(() => {});
      await clickBtn(page, /Проверить/).catch(() => {});
      await page.waitForTimeout(1500);
      extra.push(`inn-valid-msg: ${(await page.getByText(/корректен|валиден|допустим/i).count()) > 0}`);
    }
    await run("Сумма прописью", false);
    await page.getByText(/Сумма прописью/).first().click().catch(() => {});
    const words = page.locator("input").first();
    await words.fill("1500.25").catch(() => {});
    await clickBtn(page, /Прописью|Конвертировать|Преобразовать/).catch(() => {});
    await page.waitForTimeout(1200);
    extra.push(`sumwords-output: ${(await page.getByText(/одна тысяча пятьсот|рубл/i).count()) > 0}`);
    await run("КАСКО-квиз", false);
    await shots(page, "14-utils");
    report("14-utils", box, extra);
  });

  test("15-autoteka: короткий VIN не отправляется", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/autoteka");
    const vin = page.getByPlaceholder("17 символов VIN");
    await vin.waitFor({ timeout: 20000 });
    let autotekaReqs = 0;
    const h = (r: unknown) => {
      const resp = r as { url: () => string };
      if (resp.url().includes("/api/autoteka")) autotekaReqs++;
    };
    page.on("response", h as never);
    await vin.fill("XW8DNSAKF0S12345");
    await page.waitForTimeout(500);
    const btn = page.getByRole("button").filter({ hasText: /Проверить|Найти|Отправить/ }).first();
    let disabled = false;
    try {
      disabled = (await btn.isDisabled()) || (await btn.getAttribute("disabled")) === "";
    } catch {}
    extra.push(`short-vin-value-len: ${(await vin.inputValue()).length}`);
    extra.push(`submit-disabled: ${disabled}`);
    extra.push(`autoteka-api-requests: ${autotekaReqs}`);
    await shots(page, "15-autoteka");
    report("15-autoteka", box, extra);
  });

  test("16-landings: 4 страницы", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    for (const u of ["/osago", "/dkp", "/techosmotr", "/tahograph"]) {
      await nav(page, u);
      extra.push(`${u}: h1=${await isVisible(page, /<h1/i, 1).catch(() => false) || (await page.locator("h1").count()) > 0} pageerr=${box.pageErr.length}`);
      await page.locator("h1").waitFor({ timeout: 15000 }).catch(() => {});
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.screenshot({ path: path.join(OUT, `16-${u.replace("/", "")}-1440.png`) }).catch(() => {});
    }
    report("16-landings", box, extra);
  });

  test("17-private: редиректы /documents и /trash", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    for (const u of ["/documents", "/trash"]) {
      await page.goto(u, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(2500);
      const finalUrl = page.url();
      extra.push(`${u} -> ${finalUrl} login=${finalUrl.startsWith("https://dogovor.expert/login")} next=${/[?&]next=/.test(finalUrl)}`);
      await shots(page, `17-${u.replace("/", "")}`);
    }
    report("17-private", box, extra);
  });

  test("18-not-found: кастомная 404", async ({ page }) => {
    const box = track(page);
    const extra: string[] = [];
    await nav(page, "/this-page-does-not-exist-404-audit");
    extra.push(`h1-404: ${await isVisible(page, /Страница не найдена/)}`);
    extra.push(`status-fallback: ${await isVisible(page, /404/)}`);
    await shots(page, "18-not-found");
    report("18-not-found", box, extra);
  });
});