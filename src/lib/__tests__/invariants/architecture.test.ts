import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const projectRoot = path.join(__dirname, "..", "..", "..", "..");

function exists(rel: string): boolean {
  return fs.existsSync(path.join(projectRoot, rel));
}

function readFileSafe(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

describe("Architecture invariants: структура, конвенции, инфраструктура", () => {
  it("package.json содержит скрипт verify (typecheck + lint + test:unit)", () => {
    const pkg = readFileSafe(path.join(projectRoot, "package.json"));
    if (!pkg) return;
    const parsed = JSON.parse(pkg);
    expect(parsed.scripts?.verify).toBeDefined();
    expect(parsed.scripts.verify).toMatch(/typecheck/);
    expect(parsed.scripts.verify).toMatch(/lint/);
    expect(parsed.scripts.verify).toMatch(/test:unit/);
  });

  it("package.json содержит скрипт typecheck", () => {
    const pkg = readFileSafe(path.join(projectRoot, "package.json"));
    if (!pkg) return;
    const parsed = JSON.parse(pkg);
    expect(parsed.scripts?.typecheck).toMatch(/tsc/);
  });

  it(".husky/pre-commit запускает verify (а не только test:unit)", () => {
    const hookPath = path.join(projectRoot, ".husky", "pre-commit");
    const content = readFileSafe(hookPath);
    if (!content) return;
    expect(content).toMatch(/verify/);
  });

  it(".lintstagedrc.js НЕ содержит --max-warnings=0 (блокирует ВСЕ коммиты)", () => {
    const cfgPath = path.join(projectRoot, ".lintstagedrc.js");
    const content = readFileSafe(cfgPath);
    if (!content) return;
    expect(content).not.toMatch(/max-warnings\s*=\s*0/);
  });

  it("src/lib/seo/withSeo.ts существует (централизованный конструктор метаданных)", () => {
    expect(exists("src/lib/seo/withSeo.ts")).toBe(true);
  });

  it("src/app/not-found.tsx существует и имеет metadata", () => {
    const path_ = path.join(projectRoot, "src", "app", "not-found.tsx");
    const content = readFileSafe(path_);
    expect(content).toBeTruthy();
    expect(content).toMatch(/export\s+const\s+metadata/);
  });

  it("src/app/sitemap.ts существует (динамический)", () => {
    expect(exists("src/app/sitemap.ts")).toBe(true);
  });

  it("public/sitemap.xml НЕ должен существовать (статический удалён)", () => {
    expect(exists("public/sitemap.xml")).toBe(false);
  });

  it("src/middleware.ts существует", () => {
    expect(exists("src/middleware.ts")).toBe(true);
  });

  it("AGENTS.md существует", () => {
    expect(exists("AGENTS.md")).toBe(true);
  });

  it("docs/INVARIANTS.md, ARCHITECTURE.md, DATABASE.md, CHANGELOG_AGENTS.md существуют", () => {
    expect(exists("docs/INVARIANTS.md")).toBe(true);
    expect(exists("docs/ARCHITECTURE.md")).toBe(true);
    expect(exists("docs/DATABASE.md")).toBe(true);
    expect(exists("docs/CHANGELOG_AGENTS.md")).toBe(true);
  });

  it("Структура src/lib/ имеет ключевые модули", () => {
    expect(exists("src/lib/format.ts")).toBe(true);
    expect(exists("src/lib/docOcr.ts")).toBe(true);
    expect(exists("src/lib/docRequirements.ts")).toBe(true);
    expect(exists("src/lib/renderDocument.ts")).toBe(true);
    expect(exists("src/lib/ratelimit.ts")).toBe(true);
    expect(exists("src/lib/site.ts")).toBe(true);
  });

  it("Supabase клиенты существуют", () => {
    expect(exists("src/lib/supabase/server.ts")).toBe(true);
    expect(exists("src/lib/supabase/client.ts")).toBe(true);
    expect(exists("src/lib/supabase/admin.ts")).toBe(true);
  });

  it("tsconfig.json: strict mode", () => {
    const tsconfig = readFileSafe(path.join(projectRoot, "tsconfig.json"));
    if (!tsconfig) return;
    const parsed = JSON.parse(tsconfig);
    expect(parsed.compilerOptions?.strict).toBe(true);
  });

  it("next.config.mjs: НЕ должно быть ignoreDuringBuilds (ESLint должен блокировать сборку)", () => {
    const cfgPath = path.join(projectRoot, "next.config.mjs");
    const content = readFileSafe(cfgPath);
    if (!content) return;
    expect(content).not.toMatch(/ignoreDuringBuilds\s*:\s*true/);
  });

  it("Счётчик шаблонов в templates.test.ts актуален (ожидаемо 369)", () => {
    const testPath = path.join(projectRoot, "src", "lib", "__tests__", "templates.test.ts");
    const content = readFileSafe(testPath);
    if (!content) return;
    const match = content.match(/(\d+)/);
    if (match) {
      // Это best-effort проверка: счётчик должен быть >= 369
      // Если меньше — кто-то удалил шаблоны без обновления теста
      expect(Number(match[1])).toBeGreaterThanOrEqual(369);
    }
  });
});
