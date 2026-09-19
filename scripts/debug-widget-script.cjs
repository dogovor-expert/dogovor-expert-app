const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const logs = [];

  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));

  await page.goto('https://test.dogovor.expert/osago', { waitUntil: 'networkidle' });

  await page.check('input[type="checkbox"]');
  await page.click('button:has-text("Открыть калькулятор")');

  await page.waitForSelector('iframe#inssmart-b2c-frame', { timeout: 20000 }).catch(() => console.log('no iframe'));

  // dump script tag created by component
  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script[src*="inssmart"]')).map(s => ({
      outerHTML: s.outerHTML,
    }));
  });
  console.log('=== SCRIPT TAGS in container ===');
  scripts.forEach(s => console.log(s.outerHTML));

  const iframe = await page.$('iframe#inssmart-b2c-frame');
  if (iframe) {
    const src = await iframe.getAttribute('src');
    console.log('=== IFRAME SRC (JSON) ===');
    console.log(JSON.stringify(src));
    console.log('=== full ===', src);
  }

  console.log('\n=== LOGS ===');
  logs.forEach(l => console.log(l));
  await browser.close();
})();