import { test } from "@playwright/test";

const PAGES = [
  "/", "/templates", "/login", "/blog", "/blanks", "/documents/receipt-cashless",
  "/dkp", "/autoteka", "/osago", "/techosmotr", "/tahograph", "/utils",
  // 28.09.2026: /resume не был в списке — из-за этого горизонтальный скролл
  // на 390px (248px) не отлавливался диагностикой.
  "/resume", "/converter", "/ai-yurist",
];

function describe(el: Element): string {
  const cls = typeof el.className === "string" ? el.className.slice(0, 80) : "";
  return `<${el.tagName.toLowerCase()} class="${cls}">`;
}

test("overflow diagnostics", async ({ page }) => {
  test.setTimeout(300_000);
  for (const path of PAGES) {
    for (const width of [320, 360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(800);
      const report = await page.evaluate(() => {
        document.documentElement.style.setProperty("overflow-x", "visible");
        document.body.style.setProperty("overflow-x", "visible");
        const vw = document.documentElement.clientWidth;
        const doc = document.documentElement.scrollWidth;
        const bad: string[] = [];
        if (doc > vw + 1) {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
          let n = walker.nextNode() as Element | null;
          while (n) {
            const r = n.getBoundingClientRect();
            if (r.right > vw + 1 && r.width > 0) {
              const parentOverflows = (() => {
                let p = n!.parentElement;
                while (p) {
                  const cs = getComputedStyle(p);
                  if (/(auto|scroll|hidden)/.test(cs.overflowX)) return true;
                  p = p.parentElement;
                }
                return false;
              })();
              if (!parentOverflows) bad.push(`${describeStatic(n)} right=${Math.round(r.right)} w=${Math.round(r.width)}`);
            }
            n = walker.nextNode() as Element | null;
          }
        }
        function describeStatic(el: Element) {
          const cls = typeof el.className === "string" ? el.className.slice(0, 80) : "";
          return `<${el.tagName.toLowerCase()} class="${cls}">`;
        }
        return { vw, doc, bad: bad.slice(0, 12) };
      });
      if (report.doc > report.vw + 1) {
        console.log(`OVERFLOW ${path} @${width}px: scrollWidth=${report.doc} > ${report.vw}`);
        for (const b of report.bad) console.log(`   ${b}`);
      } else {
        console.log(`ok ${path} @${width}px`);
      }
    }
  }
});
