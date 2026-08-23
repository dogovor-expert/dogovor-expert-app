const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TARGET_DIRS = ["src"];
const EXCLUDE_DIRS = ["node_modules", ".next"];
const EXCLUDE_FILES = ["globals.css"];

const REPLACEMENTS = [
  { from: /(?<!placeholder:|disabled:)text-gray-400/g, to: "text-gray-600" },
  { from: /(?<!placeholder:|disabled:)text-gray-500/g, to: "text-gray-600" },
  { from: /(?<!placeholder:|disabled:)text-slate-400/g, to: "text-slate-600" },
  { from: /(?<!placeholder:|disabled:)text-slate-500/g, to: "text-slate-600" },
  { from: /(?<!placeholder:|disabled:)text-amber-500/g, to: "text-amber-700" },
  { from: /(?<!placeholder:|disabled:)text-amber-600/g, to: "text-amber-700" },
];

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) walk(full, files);
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(entry.name)) {
      if (!EXCLUDE_FILES.includes(entry.name)) files.push(full);
    }
  }
  return files;
}

const files = walk(path.join(ROOT, "src"), []);
let changedFiles = 0;
let totalChanges = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf-8");
  let changed = false;
  for (const { from, to } of REPLACEMENTS) {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      changed = true;
      totalChanges += matches.length;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log("✅ " + path.relative(ROOT, file));
  }
}

console.log(`\nИзменено файлов: ${changedFiles}, замен: ${totalChanges}`);
