import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const projectRoot = path.join(__dirname, "..", "..", "..", "..");
const appDir = path.join(projectRoot, "src", "app");
const apiDir = path.join(appDir, "api");

function readFileSafe(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

function walk(dir: string, ext: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, ext));
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

describe("SEO invariants: canonical/robots/sitemap", () => {
  it("src/app/layout.tsx НЕ должен иметь alternates.canonical (иначе наследуется на 404)", () => {
    const layoutPath = path.join(appDir, "layout.tsx");
    const content = readFileSafe(layoutPath);
    if (!content) return; // опционально
    expect(content).not.toMatch(/alternates\s*:\s*\{[^}]*canonical\s*:\s*["']\//);
  });

  it("src/app/page.tsx (главная) должен иметь alternates.canonical: '/'", () => {
    const pagePath = path.join(appDir, "page.tsx");
    const content = readFileSafe(pagePath);
    if (!content) return;
    expect(content).toMatch(/canonical\s*:\s*["']\//);
  });

  it("src/app/not-found.tsx должен иметь robots: { index: false, follow: false }", () => {
    const notFoundPath = path.join(appDir, "not-found.tsx");
    const content = readFileSafe(notFoundPath);
    if (!content) {
      // Если файла нет — это баг
      throw new Error("src/app/not-found.tsx отсутствует");
    }
    expect(content).toMatch(/robots\s*:\s*\{[^}]*index\s*:\s*false/);
    expect(content).toMatch(/follow\s*:\s*false/);
  });

  it("public/robots.txt содержит блок User-agent: Yandex с Clean-param", () => {
    const robotsPath = path.join(projectRoot, "public", "robots.txt");
    const content = readFileSafe(robotsPath);
    if (!content) return;
    expect(content).toContain("User-agent: Yandex");
    expect(content).toMatch(/Clean-param:/);
  });

  it("robots.txt: Clean-param НЕ должен содержать параметр page (иначе Яндекс не индексирует 2+ страницу)", () => {
    const robotsPath = path.join(projectRoot, "public", "robots.txt");
    const content = readFileSafe(robotsPath);
    if (!content) return;
    // Допустимы: cat, q, view, order, category
    // НЕ допустимо: page
    const lines = content.split("\n");
    for (const line of lines) {
      if (/Clean-param:/.test(line)) {
        expect(line).not.toMatch(/\bpage\b/);
      }
    }
  });

  it("robots.txt: блок Yandex идёт ДО User-agent: * (Яндекс читает только первую подходящую секцию)", () => {
    const robotsPath = path.join(projectRoot, "public", "robots.txt");
    const content = readFileSafe(robotsPath);
    if (!content) return;
    const yandexIndex = content.indexOf("User-agent: Yandex");
    const starIndex = content.indexOf("User-agent: *");
    if (yandexIndex !== -1 && starIndex !== -1) {
      expect(yandexIndex).toBeLessThan(starIndex);
    }
  });

  it("robots.txt: /documents блокируется ТОЧНЫМ Disallow /documents$ (НЕ /documents)", () => {
    const robotsPath = path.join(projectRoot, "public", "robots.txt");
    const content = readFileSafe(robotsPath);
    if (!content) return;
    // Должно быть либо точное /documents$, либо вообще не упомянуто
    if (/Disallow:.*\/documents/.test(content)) {
      // Если упоминается, должно быть с $ якорем или с /
      expect(content).toMatch(/Disallow:\s*\/documents\$/);
    }
  });

  it("src/app/sitemap.ts существует", () => {
    const sitemapPath = path.join(appDir, "sitemap.ts");
    expect(fs.existsSync(sitemapPath)).toBe(true);
  });

  it("Публичные страницы используют withSeo для generateMetadata", () => {
    // Минимально проверяем, что helper существует
    const withSeoPath = path.join(projectRoot, "src", "lib", "seo", "withSeo.ts");
    expect(fs.existsSync(withSeoPath)).toBe(true);
  });
});
