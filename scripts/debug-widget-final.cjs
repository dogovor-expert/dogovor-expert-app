const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));
  page.on('response', res => {
    if (res.url().includes('inssmart') && res.status() >= 400) logs.push(`[HTTP ${res.status()}] ${res.request().method()} ${res.url()}`);
  });

  await page.goto('https://test.dogovor.expert/osago', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('dogovor_inssmart_osago_consent_v1'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.check('input[type="checkbox"]');
  await page.click('button:has-text("Открыть калькулятор")');

  await page.waitForSelector('iframe#inssmart-b2c-frame', { timeout: 20000 });
  const frame = page.frame({ url: /widgets\.inssmart\.ru/ });
  if (frame) {
    try {
      await frame.waitForSelector('input, button, [class*="css"]', { timeout: 25000 });
      await new Promise(r => setTimeout(r, 8000));
      const html = await frame.content();
      const hasError = html.includes('Не удалось загрузить модуль');
      const hasLoading = html.includes('Загрузка модуля');
      const inputCount = await frame.locator('input').count();
      const buttonCount = await frame.locator('button').count();
      const visibleText = await frame.evaluate(() => document.body.innerText.slice(0, 500));
      console.log('ERROR BLOCK:', hasError);
      console.log('LOADING BLOCK:', hasLoading);
      console.log('inputs:', inputCount, 'buttons:', buttonCount);
      console.log('visible text ===');
      console.log(visibleText);
    } catch (e) {
      console.log('frame wait failed:', e.message);
    }
    const h = await page.getAttribute('iframe#inssmart-b2c-frame', 'height').catch(()=>null);
    const dim = await page.$eval('iframe#inssmart-b2c-frame', el => ({w: el.clientWidth, ht: el.clientHeight})).catch(()=>null);
    console.log('iframe dims:', JSON.stringify(dim));
  } else {
    console.log('NO FRAME matched widgets.inssmart.ru');
  }
  await page.screenshot({ path: 'C:/Users/alikpc/AppData/Local/Temp/opencode/widget_final.png' });
  console.log('\n=== LOGS ===');
  logs.forEach(l => console.log(l));
  await browser.close();
})();