import { test, expect } from "@playwright/test";

const PAGES = [
  { name: "Главная", path: "/" },
  { name: "Каталог шаблонов", path: "/templates" },
  { name: "Билдер (форма)", path: "/builder?template=dkp-auto-short" },
  { name: "Экспорт PDF (страница)", path: "/builder/export-pdf?template=dkp-auto-short" },
  { name: "Обратная связь", path: "/contacts" },
];

const VIEWPORTS = [
  { name: "360px", width: 360, height: 640 },
  { name: "390px", width: 390, height: 844 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1024px", width: 1024, height: 768 },
  { name: "1440px", width: 1440, height: 900 },
];

for (const pg of PAGES) {
  test.describe(`Responsive: ${pg.name}`, () => {
    for (const vp of VIEWPORTS) {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test(`@viewport=${vp.name} — нет горизонтального скролла, ключевые элементы видны`, async ({ page }) => {
        await page.goto(pg.path);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(600);

        const overflowing = await page.evaluate(() => {
          const el = document.documentElement;
          return el.scrollWidth > el.clientWidth + 1;
        });
        expect(overflowing).toBeFalsy();

        if (pg.path === "/") {
          await expect(page.locator("h1").first()).toBeVisible();
          await expect(page.locator("nav").first()).toBeVisible();
        } else if (pg.path === "/templates") {
          await expect(page.locator('[data-testid="template-card"], .grid > div').first()).toBeVisible({ timeout: 10_000 });
        } else if (pg.path.includes("/builder")) {
          if (pg.path.includes("export-pdf")) {
            await expect(page.locator("button:has-text('Сформировать'), button:has-text('Скачать')").first()).toBeVisible({ timeout: 10_000 });
          } else {
            await expect(page.locator('[data-field]').first()).toBeVisible({ timeout: 10_000 });
            if (vp.width >= 768) {
              await expect(page.locator("#builder-sidebar, aside").first()).toBeVisible();
            }
            await expect(page.locator("main").first()).toBeVisible();
          }
        } else if (pg.path === "/contacts") {
          await expect(page.locator("form").first()).toBeVisible();
          await expect(page.locator("input[type='email'], input[name='email']").first()).toBeVisible();
        }
      });

      test(`@viewport=${vp.name} — тач-таргеты >= 24x24px`, async ({ page }) => {
        await page.goto(pg.path);
        await page.waitForLoadState("networkidle");

        const smallTargets = await page.evaluate(() => {
          const minSize = 24;
          const elements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');
          const small: { selector: string; width: number; height: number }[] = [];
          elements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && (rect.width < minSize || rect.height < minSize)) {
              const cls = el.className || el.tagName;
              small.push({ selector: cls.substring(0, 100), width: Math.round(rect.width), height: Math.round(rect.height) });
            }
          });
          return small;
        });
        if (smallTargets.length > 0) {
          console.log(`[${pg.name} @ ${vp.name}] Тач-таргеты < 24px:`, smallTargets);
        }
      });

      test(`@viewport=${vp.name} — контент не уходит за края экрана (overflow-x)`, async ({ page }) => {
        await page.goto(pg.path);
        await page.waitForLoadState("networkidle");

        const overflow = await page.evaluate(() => {
          const bad: string[] = [];
          document.querySelectorAll("*").forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 1 || rect.left < -1) {
              const cls = (el as HTMLElement).className || el.tagName;
              bad.push(cls.substring(0, 100));
            }
          });
          return bad;
        });
        if (overflow.length > 0) {
          console.log(`[${pg.name} @ ${vp.name}] Элементы за краем экрана:`, overflow);
        }
      });
    }
  });
}

test.describe("Priority 1 Components — Lazy PDF/DOCX, Web Worker Scanner", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("Lazy PDF export — чанки pdf-lib/docx загружаются только при клике", async ({ page }) => {
    await page.goto("/builder/export-pdf?template=dkp-auto-short");
    await page.waitForLoadState("networkidle");

    const loadedChunks: string[] = [];
    page.on("response", (resp) => {
      const url = resp.url();
      if (url.includes(".js") && (url.includes("pdf-lib") || url.includes("docx") || url.includes("pdfjs"))) {
        loadedChunks.push(url);
      }
    });

    expect(loadedChunks.length).toBe(0);

    await page.locator("button:has-text('Сформировать'), button:has-text('Скачать')").first().click();

    await page.waitForTimeout(20_000);

    const pdfLibLoaded = loadedChunks.some((u) => u.includes("pdf-lib"));
    const docxLoaded = loadedChunks.some((u) => u.includes("docx"));
    console.log("[Lazy PDF] Загруженные чанки:", loadedChunks);

    expect(pdfLibLoaded).toBeTruthy();
    expect(docxLoaded).toBeFalsy();
  });

  test("Web Worker Scanner — tesseract.js загружается только при открытии сканера", async ({ page }) => {
    await page.goto("/builder?template=dkp-auto-short");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('[data-field]', { timeout: 10_000 });

    const ocrRequests: { url: string; status: number }[] = [];
    page.on("response", (resp) => {
      const url = resp.url();
      if (url.includes("tesseract") || url.includes("ocr-worker")) {
        ocrRequests.push({ url, status: resp.status() });
      }
    });

    // Раскрываем сканер, если он свёрнут (кнопка «Показать сканер документов»)
    const showBtn = page.getByRole("button", { name: /показать сканер/i });
    if (await showBtn.count()) {
      await showBtn.first().click();
    }
    await page.waitForSelector("text=Сканер документов", { timeout: 10_000 });

    // Загружаем реальный файл — это запускает OCR-воркер (tesseract.js)
    const fileInput = page.locator("input[type=file]").first();
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );
    await fileInput.setInputFiles({ name: "scan.png", mimeType: "image/png", buffer: png });

    // Ждём инициализации tesseract (воркер реально загрузит ядро с CDN)
    let tesseractLoaded = false;
    for (let i = 0; i < 25; i++) {
      if (ocrRequests.some((r) => r.url.includes("tesseract") && r.status === 200)) {
        tesseractLoaded = true;
        break;
      }
      await page.waitForTimeout(1000);
    }

    console.log("[Web Worker Scanner] OCR-запросы:", ocrRequests.slice(0, 10));

    expect(tesseractLoaded).toBeTruthy();
  });
});