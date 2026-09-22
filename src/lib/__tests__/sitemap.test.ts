import { describe, it, expect } from "vitest";
import sitemap, { parseLastUpdated } from "@/app/sitemap";
import { SITE_URL } from "@/lib/site";

const entries = sitemap();
const urls = entries.map((e) => e.url);

describe("sitemap: технические инварианты", () => {
  it("все URL абсолютные https и без дублей", () => {
    expect(urls.every((u) => u.startsWith("https://"))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("НЕ содержит noindex/служебных страниц (конфликт sitemap↔noindex)", () => {
    const forbidden = [
      "/security",
      "/documents",
      "/login",
      "/preview",
      "/builder",
      "/dashboard",
      "/settings",
      "/trash",
      "/billing",
      "/connections",
      "/approve",
    ];
    for (const p of forbidden) {
      expect(urls, `sitemap не должен содержать ${p}`).not.toContain(`${SITE_URL}${p}`);
    }
  });

  it("содержит публичный legal/trademark", () => {
    expect(urls).toContain(`${SITE_URL}/legal/trademark`);
  });

  it("бланки-дубли /blanks/{id} в sitemap не попадают (только каталог /blanks)", () => {
    const blankDeep = urls.filter((u) => /\/blanks\/.+/.test(u));
    expect(blankDeep).toHaveLength(0);
    expect(urls).toContain(`${SITE_URL}/blanks`);
  });

  it("у статей блога есть lastModified (ISO-даты парсятся)", () => {
    const post = entries.find((e) => e.url === `${SITE_URL}/blog/raspiska-ili-rospiska`);
    expect(post?.lastModified).toBe("2026-09-22");
  });
});

describe("parseLastUpdated", () => {
  it("ISO-дата", () => {
    expect(parseLastUpdated("2026-09-22")).toBe("2026-09-22");
    expect(parseLastUpdated("2026-09-22T10:00:00Z")).toBe("2026-09-22");
  });
  it("кириллическая дата шаблонов", () => {
    expect(parseLastUpdated("обновлено августа 2026")).toBe("2026-08-01");
  });
  it("непонятный формат → undefined", () => {
    expect(parseLastUpdated("")).toBeUndefined();
    expect(parseLastUpdated("скоро")).toBeUndefined();
  });
});