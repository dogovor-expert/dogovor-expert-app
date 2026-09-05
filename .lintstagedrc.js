// .lintstagedrc.js — конфиг для lint-staged
// Запускает prettier только на staged-файлах перед коммитом (быстрее, чем на всём проекте)
// biome.json применяется для проверки (biome check) в отдельном шаге, см. .husky/pre-commit
export default {
  '*.{ts,tsx}': ['prettier --write'],
  '*.{js,jsx}': ['prettier --write'],
  '*.{css,scss,json,md,yml,yaml}': ['prettier --write'],
  // Бинарные и автогенерируемые — не трогаем
  '!public/workers/**': false,
  '!*.min.js': false,
  '!*.bundle.js': false,
  '!next-env.d.ts': false,
  '!tsconfig.tsbuildinfo': false,
};
