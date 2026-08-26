import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage();
await p.goto("https://dogovor.expert/connections", { waitUntil: "networkidle" }).catch(() => {});
await p.waitForTimeout(2000);
const guides = await p.locator("summary").count();
const copyBtns = await p.locator("button", { hasText: "копировать" }).count();
console.log("guides summaries:", guides, "| copy buttons:", copyBtns);
if (guides > 0) {
  await p.locator("summary").first().click();
  await p.waitForTimeout(400);
  const stepsText = await p.locator("ol").first().innerText().catch(() => "");
  console.log("--- первые шаги инструкции Яндекса ---");
  console.log(stepsText.split("\n").slice(0, 6).join("\n"));
}
await b.close();