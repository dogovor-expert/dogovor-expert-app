/**
 * PageSpeed Insights API (тот же движок, что pagespeed.web.dev).
 * Даёт лабораторные Lighthouse-метрики + полевые CrUX (реальные пользователи).
 *
 * Использование:
 *   node scripts/psi.mjs [url] [strategy]      # strategy: mobile | desktop
 *   npm run psi                                # mobile + desktop для SITE_URL
 *
 * Без ключа работает с низким лимитом; PSI_API_KEY повышает квоту.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dogovor.expert";

const url = process.argv[2] || SITE_URL;
const strategies = process.argv[3] ? [process.argv[3]] : ["mobile", "desktop"];
const key = process.env.PSI_API_KEY;

for (const strategy of strategies) {
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", strategy);
  for (const c of ["performance", "seo", "best-practices", "accessibility"]) {
    endpoint.searchParams.set("category", c);
  }
  if (key) endpoint.searchParams.set("key", key);

  process.stderr.write(`PSI ${strategy}: ${url} …\n`);
  const res = await fetch(endpoint, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) {
    console.error(`[${strategy}] HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    process.exitCode = 1;
    continue;
  }
  const data = await res.json();
  const lr = data.lighthouseResult;
  const fmt = (s) => (s == null ? "n/a" : Math.round(s * 100));

  console.log(`\n=== ${url} [${strategy}] ===`);
  for (const [name, cat] of Object.entries(lr.categories)) {
    console.log(`  ${name.padEnd(16)} ${fmt(cat.score)}/100`);
  }

  const audits = lr.audits;
  const cwv = [
    ["FCP", audits["first-contentful-paint"]?.displayValue],
    ["LCP", audits["largest-contentful-paint"]?.displayValue],
    ["TBT", audits["total-blocking-time"]?.displayValue],
    ["CLS", audits["cumulative-layout-shift"]?.displayValue],
    ["SI", audits["speed-index"]?.displayValue],
  ];
  for (const [name, val] of cwv) console.log(`  ${name.padEnd(16)} ${val ?? "n/a"}`);

  const field = data.loadingExperience;
  if (field?.metrics) {
    console.log("  --- CrUX (полевые, реальные пользователи) ---");
    console.log(`  verdict: ${field.overall_category}`);
    for (const [name, m] of Object.entries(field.metrics)) {
      console.log(`  ${name.padEnd(28)} p75=${m.percentile} (${m.category})`);
    }
  } else {
    console.log("  --- CrUX: недостаточно данных для этого URL ---");
  }
}
