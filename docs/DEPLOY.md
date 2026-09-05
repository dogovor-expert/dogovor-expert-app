# Deploy и проверка продакшена

> Вынесено из AGENTS.md (19.08.2026). Причина: поток деплоя и проверки — это отдельный процесс с собственными инструментами.

## Актуальный флоу (19.08.2026)

- Деплой: `npx vercel --prod --yes --cwd "D:\Мои сайты\site Dogovor"` (прямой флоу; robocopy-флоу ниже — старый, использовать только если прямой падает).
- «Ready» ≠ код на проде. Проверять фактически: скачивание PDF с прода через playwright (`%TEMP%\opencode\e2e-*.cjs` — chromium из ms-playwright; селекторы: кнопка по тексту «Скачать PDF», select по индексу; ждать гидрации: клик → появление «Генерация…») и программный анализ скачанного PDF через pdfjs-dist (`node_modules/pdfjs-dist/legacy/build/pdf.mjs`, polyfill DOMMatrix; скрипты `%TEMP%\opencode\check-gaps-file.cjs`, `dump-lines.cjs` — текст с y-координатами, зазоры, дубли страниц).
- Кириллица в PowerShell: `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` перед запуском node-скриптов; чтение файлов — `ReadAllText(..., UTF8)`.

## Старый флоу (robocopy)

> Использовать ТОЛЬКО если прямой флоу падает. Прямой флоу Vercel CLI — preferred.

- Загрузка идёт из `%LOCALAPPDATA%\Temp\opencode\proj` — перед деплоем синхронизировать: `robocopy /MIR /XD node_modules .git .next e2e test-results coverage .vercel /XF *.md *.log *.pdf <проект> <proj>` и обязательно скопировать свежий `.next` (`robocopy <проект>\.next <proj>\.next /MIR /XD cache`).
- **ВНИМАНИЕ:** НЕ исключать `*.png` из robocopy — `public/og-image.png` (OG-превью, 1200×630) и `public/apple-icon.png` (iOS-иконка, 180×180) обязаны попасть в деплой. Проверено 17.08.2026: `/XF *.png` в команде синхронизации приводил к 404 на обоих файлах.
- **ВАЖНО:** `proj` должен содержать ВЕСЬ проект (src, public, конфиги, package.json/lock), а не только `.next` — Vercel запускает реальный `next build` в облаке. Если загрузить только `.next`, билд падает с `missing_pages_app` или `NEXT_NO_VERSION` (нет package.json). Оба проверены 16.08.2026.
- `vercel-finalize.ps1` сам до-загружает `package.json`/`package-lock.json` из исходников и подменяет их sha в манифесте (в `.next` лежит служебный `package.json` — `{"type":"module"}`, билдеру он не подходит; без подмены — `duplicated_file_path`).
- «READY+PROMOTED» НЕ означает доставку кода. Проверять фактически: бандл с прода (маркер `this.y=o.h-i.top`), PDF с прода.
- **НЕЛЬЗЯ** заливать в деплой папку `.vercel` (и `.vercel/output`): если она попадает в файлы деплоя, Vercel подхватывает её как «prebuilt build artifacts» вместо реальной сборки и сайт отдаёт 404 на всех страницах (проверено 16.08.2026). То же касается `.next/cache`. Синхронизация строго с `/XD .vercel` и `/XD cache`, иначе сайт «умирает».
- `npm run test:prod` — скачивает реальные PDF с прода (`e2e/prod-export.spec.ts`).

## Тесты

- Unit: `npm run test:unit` (vitest).
- E2E локальные: `npm run test:e2e` (playwright, 3100).
- E2E прод: `npm run test:prod`.

## E2E-скрипты с сессией (19.08.2026)

Для проверки авторизованных страниц прода: `%TEMP%\opencode\e2e-prod-billing-auth.cjs` — логин через supabase-js (ключ `NEXT_PUBLIC_SUPABASE_ANON_KEY` из `.env.production`, обрезать кавычки), cookie `sb-<ref>-auth-token` = `"base64-" + base64url(JSON.stringify(session БЕЗ user))` (формат @supabase/ssr v0.12; массив `[at,rt,null,tt,ei,user]` НЕ работает). Cookie: domain dogovor.expert, path /, httpOnly, secure, sameSite Lax.

Playwright: `$env:NODE_PATH = "D:\Мои сайты\site Dogovor\node_modules"`, goto ждать `domcontentloaded` + retry ×3 (на проде бывают сетевые таймауты), баннер cookies кликать «Принять», контент биллинга ждать исчезновения «Загрузка…» (waitForFunction).