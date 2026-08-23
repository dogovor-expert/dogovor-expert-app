// Отправка URL в IndexNow (Bing, Яндекс, Seznam, Naver).
// Использование:
//   node scripts/indexnow.mjs            — отправить все URL из sitemap.xml
//   node scripts/indexnow.mjs /blog/foo  — отправить один URL
const HOST = "https://dogovor.expert";
const KEY = "60f95e2da98647ee80eb7f741083f90c";
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function main() {
  const single = process.argv[2];
  let urlList = [];

  if (single) {
    urlList = [HOST + single];
  } else {
    const res = await fetch(`${HOST}/sitemap.xml`);
    if (!res.ok) throw new Error(`sitemap: HTTP ${res.status}`);
    const xml = await res.text();
    urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  }

  // IndexNow принимает максимум 10 000 URL за раз — шлём частями
  const CHUNK = 1000;
  for (let i = 0; i < urlList.length; i += CHUNK) {
    const chunk = urlList.slice(i, i + CHUNK);
    const body = {
      host: "dogovor.expert",
      key: KEY,
      keyLocation: `${HOST}/${KEY}.txt`,
      urlList: chunk,
    };
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    const status = r.status;
    const reason = status === 200 ? "OK" : await r.text();
    console.log(`chunk ${i / CHUNK + 1}: ${chunk.length} url, HTTP ${status} ${status === 200 ? "" : reason}`);
  }
  console.log(`итого отправлено: ${urlList.length} url`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
