# Правила среды выполнения (Windows / OpenCode)

> Добавлено 05.09.2026. Причина: невидимые байты CRLF и неправильная кодировка ломали регулярные выражения агента и коммиты commitlint.

## 1. Окончания строк — ТОЛЬКО LF (`\n`)

- В проекте запрещён CRLF. Контролируется `.gitattributes` (`* text=auto eol=lf`) и `.editorconfig` (`end_of_line = lf`).
- При редактировании файлов никогда не сопоставляй `\r\n` в regex/строковом поиске.
- Если строковый поиск не срабатывает — не пиши сложные многострочные регулярные выражения. Используй замену целых функций или чтение по точным номерам строк (`offset`/`limit`).
- Lock-файлы (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) помечены `-merge` — Git не пытается трёхсторонний merge, всегда берёт наш.

## 2. Кодировка — ТОЛЬКО UTF-8 без BOM

- Все файлы исходного кода, документации и JSON обязаны сохраняться в UTF-8 no-BOM.
- При записи через PowerShell 5.1 использовать `[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))` — прямой параметр `utf8NoBOM`/`utf8BOM` есть только в PS 7.1+.
- `commitlint` падает на BOM в `package.json` (видит `\uFEFF` в начале) — после любых записей этого файла проверять байты `[0xEF,0xBB,0xBF]`.

## 3. Безопасная замена кода

- При замене блоков кода бери в качестве якоря (context) 2–3 уникальные строки до и после изменяемого фрагмента, чтобы замена не зависела от единичных пробелов и переводов строк.
- Если в проекте PowerShell 5.1 — избегай bash-конструкций (`for...do`, `||`, `?.` в `node -e`); используй отдельные `.cjs`/`.mjs` файлы.

## 4. Локальный Git config (только этот репо)

- `core.autocrlf=false`, `core.eol=lf` — НЕ глобально (не трогаем другие репозитории пользователя).
- Проверить: `git config --local --get core.autocrlf` → `false`, `git config --local --get core.eol` → `lf`.

## 5. Служебные конфиги не должны попасть в Docker-деплой

- `.dockerignore` исключает: `node_modules`, `.next`, `.git`, `.vercel`, `playwright-report`, `test-results`, `visual-report`, `audit-shots`, `audit`, `reports`, `.lighthouseci`, `coverage`, `.env*`, `*.log`, `.nx`, `.storybook`. Если в образ случайно попадают `docs/`, IDE-правила (`.clinerules`, `.windsurfrules`, `.github/copilot-instructions.md`) и т.п. — дополнить `.dockerignore` (билд-контекст должен быть минимальным).
- `.gitattributes` и `.editorconfig` — НЕ исключаем: они служат Git и редакторам, в bundle Next.js не попадают.
- `.vercelignore` — легаси-артефакт (актуальный деплой — Docker на CapRover); можно удалить вместе с `vercel.json` и `.vercel/`.

## 6. OpenCode shell — PowerShell (НЕ переключаем на Git Bash)

- Решение владельца: OpenCode работает через PowerShell 5.1 (поддержка с PR #16069, март 2026, парсинг через tree-sitter-powershell).
- Альтернатива (env `SHELL=C:\Program Files\Git\bin\bash.exe`) НЕ применяется — сломает PS-only скрипты (`Start-Process npx.cmd`, `[System.IO.File]::WriteAllText`, `Get-NetTCPConnection`).
- `terminal.shell` в `opencode.json` НЕ поддерживается — этот ключ выдуман, реальный способ только через env `SHELL`.