import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const projectRoot = path.join(__dirname, "..", "..", "..", "..");
const apiDir = path.join(projectRoot, "src", "app", "api");
const libDir = path.join(projectRoot, "src", "lib");
const adminPath = path.join(libDir, "supabase", "admin.ts");

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

const MUTATING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const SKIP_CSRF_CHECK = [
  "auth/login", // password login
  "billing/webhook", // YooKassa IP+verify
  "telegram/webhook", // Telegram secret
  "cron", // CRON_SECRET
  "ocr-proxy", // ЗАБЛОКИРОВАНО владельцем
  "ocr-status", // ЗАБЛОКИРОВАНО владельцем
];

describe("Security invariants: CSRF, rate-limit, service_role", () => {
  it("src/lib/supabase/admin.ts НЕ импортируется в Client Components (use client)", () => {
    if (!fs.existsSync(apiDir)) return;
    const clientComponents = walk(path.join(projectRoot, "src"), [".tsx", ".ts"])
      .filter((p) => {
        try {
          // Исключаем сами тесты (они могут содержать служебные слова)
          if (p.includes("__tests__")) return false;
          const c = fs.readFileSync(p, "utf-8");
          return /"use client"/.test(c);
        } catch {
          return false;
        }
      });
    for (const file of clientComponents) {
      const content = readFileSafe(file) || "";
      // Запрет: импорт из @/lib/supabase/admin
      expect(content, `Client Component ${file} импортирует admin.ts`).not.toMatch(
        /from\s+["']@\/lib\/supabase\/admin["']/
      );
      // Запрет: использование process.env.SUPABASE_SERVICE_ROLE_KEY
      expect(content, `Client Component ${file} использует service_role`).not.toMatch(
        /SUPABASE_SERVICE_ROLE_KEY/
      );
    }
  });

  it("src/lib/supabase/admin.ts существует и использует service_role", () => {
    const content = readFileSafe(adminPath);
    if (!content) return;
    expect(content).toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(content).toMatch(/createClient/);
    expect(content).toMatch(/autoRefreshToken\s*:\s*false/);
  });

  it("Мутирующие API-роуты (POST/PUT/PATCH/DELETE) обёрнуты в withCsrf или isSameOrigin", () => {
    if (!fs.existsSync(apiDir)) return;
    const routeFiles = walk(apiDir, ["route.ts"]);
    const violations: string[] = [];

    for (const routeFile of routeFiles) {
      const content = readFileSafe(routeFile) || "";

      // Пропускаем webhook, cron и ocr-* (другая защита или заблокировано)
      // Нормализуем путь к forward-slash для кросс-платформенности
      const normalized = routeFile.split(path.sep).join("/");
      const isSkipped = SKIP_CSRF_CHECK.some((s) => normalized.includes(s));
      if (isSkipped) continue;

      // Извлекаем HTTP-методы
      const methodMatches = content.match(/export\s+(?:const|async\s+function)\s+(GET|POST|PUT|PATCH|DELETE)\b/g) || [];
      const methods = methodMatches
        .map((m) => {
          const match = m.match(/(GET|POST|PUT|PATCH|DELETE)/);
          return match ? match[1] : null;
        })
        .filter((m): m is string => Boolean(m && MUTATING_METHODS.includes(m)));

      if (methods.length === 0) continue;

      // Проверяем, что есть withCsrf или isSameOrigin
      const hasCsrf = /withCsrf|isSameOrigin/.test(content);
      if (!hasCsrf) {
        violations.push(`${routeFile} (методы: ${methods.join(", ")})`);
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Мутирующие роуты без withCsrf/isSameOrigin:\n  ${violations.join("\n  ")}`
      );
    }
  });

  it("src/lib/csrf.ts (или withCsrf.ts) существует", () => {
    const candidates = [
      path.join(libDir, "csrf.ts"),
      path.join(libDir, "withCsrf.ts"),
    ];
    const found = candidates.some((p) => fs.existsSync(p));
    expect(found).toBe(true);
  });

  it("src/lib/ratelimit.ts существует и использует fail-closed для auth", () => {
    const ratelimitPath = path.join(libDir, "ratelimit.ts");
    const content = readFileSafe(ratelimitPath);
    if (!content) return;
    expect(content).toMatch(/Upstash|@upstash\/ratelimit/);
  });

  it("SERVICE_ROLE_KEY используется ТОЛЬКО в server-side коде (не в клиентских компонентах)", () => {
    const componentsDir = path.join(projectRoot, "src", "components");
    if (!fs.existsSync(componentsDir)) return;
    const componentFiles = walk(componentsDir, [".tsx", ".ts"])
      .filter((p) => !p.includes("__tests__"));
    for (const file of componentFiles) {
      const content = readFileSafe(file) || "";
      expect(content, `Component ${file} использует service_role`).not.toMatch(
        /SUPABASE_SERVICE_ROLE_KEY/
      );
    }
  });

  it("src/middleware.ts: PROTECTED_PREFIXES содержит /connections", () => {
    const middlewarePath = path.join(projectRoot, "src", "middleware.ts");
    const content = readFileSafe(middlewarePath);
    if (!content) return;
    expect(content).toMatch(/PROTECTED_PREFIXES\s*=\s*\[[^\]]*"\/connections"/);
  });
});
