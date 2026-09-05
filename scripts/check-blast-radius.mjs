#!/usr/bin/env node
/**
 * BLAST RADIUS CHECK (AGENTS.md протокол)
 *
 * Перед изменением файла X агент ОБЯЗАН знать всех его потребителей.
 * Этот скрипт:
 *   1. Берёт путь к файлу (или список файлов из `git diff --name-only`)
 *   2. Ищет все файлы, которые импортируют X или используют его публичное API
 *   3. Возвращает JSON + человеко-читаемый отчёт
 *
 * Использование:
 *   node scripts/check-blast-radius.mjs <file> [file2 ...]
 *   node scripts/check-blast-radius.mjs --staged   # из git index
 *   node scripts/check-blast-radius.mjs --changed  # из последнего коммита
 *
 * Exit code:
 *   0 — найдены потребители (можно продолжать)
 *   1 — ошибка аргументов
 */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, relative, basename, extname } from "node:path";

const ROOT = resolve(process.cwd());
const SRC = resolve(ROOT, "src");

function getFilesFromGit(mode) {
  const cmd =
    mode === "--staged"
      ? "git diff --cached --name-only --diff-filter=ACMR"
      : "git diff HEAD --name-only --diff-filter=ACMR";
  try {
    const out = execSync(cmd, { encoding: "utf8", cwd: ROOT });
    return out
      .split("\n")
      .map((s) => s.trim())
      .filter((f) => f && f.startsWith("src/") && /\.(ts|tsx)$/.test(f));
  } catch {
    return [];
  }
}

function toFiles(args) {
  if (args.includes("--staged") || args.includes("--changed")) {
    return getFilesFromGit(args.find((a) => a.startsWith("--")));
  }
  return args.filter((a) => !a.startsWith("--") && a.startsWith("src/") && /\.(ts|tsx)$/.test(a));
}

function toNameVariants(file) {
  // src/lib/seo/withSeo.ts → withSeo
  const base = basename(file, extname(file));
  return [base];
}

function toImportRegex(name) {
  // Слово целиком, в импортах, типах, JSDoc
  return new RegExp(
    `\\b(from\\s+['"\`].*?${name}['"\`]|import\\s*\\(\\s*['"\`].*?${name}['"\`]|require\\(['"\`].*?${name}['"\`]\\)|\\b${name}\\b\\s*[:\\)\\(<>])`,
  );
}

function findConsumers(target, allFiles) {
  const variants = toNameVariants(target);
  const consumers = new Set();
  for (const f of allFiles) {
    if (f === target) continue;
    let content;
    try {
      content = readFileSync(resolve(ROOT, f), "utf8");
    } catch {
      continue;
    }
    for (const v of variants) {
      if (toImportRegex(v).test(content)) {
        consumers.add(f);
        break;
      }
    }
  }
  return [...consumers];
}

function walkAllTsFiles() {
  // Простая реализация: ищем все .ts/.tsx в src/
  try {
    const out = execSync('git ls-files "src/**/*.ts" "src/**/*.tsx"', {
      encoding: "utf8",
      cwd: ROOT,
    });
    return out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node scripts/check-blast-radius.mjs <file> [file2 ...] | --staged | --changed");
    process.exit(1);
  }
  const files = toFiles(args);
  if (files.length === 0) {
    console.error("No source files to analyze.");
    process.exit(1);
  }
  const allFiles = walkAllTsFiles();
  const result = {};
  for (const f of files) {
    if (!existsSync(resolve(ROOT, f))) {
      console.error(`File not found: ${f}`);
      process.exit(1);
    }
    const consumers = findConsumers(f, allFiles);
    result[f] = consumers.sort();
  }

  // Печать
  console.log("\n=== BLAST RADIUS ANALYSIS ===\n");
  let totalConsumers = 0;
  for (const [file, consumers] of Object.entries(result)) {
    console.log(`📄 ${file}`);
    if (consumers.length === 0) {
      console.log("   (no consumers — safe to change freely)\n");
    } else {
      console.log(`   ${consumers.length} consumer(s):`);
      for (const c of consumers) console.log(`   → ${c}`);
      console.log();
      totalConsumers += consumers.length;
    }
  }
  console.log(`Total consumers across ${files.length} file(s): ${totalConsumers}\n`);

  // JSON на stdout для интеграции с агентом
  if (process.env.JSON === "1") {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  }
}

main();
