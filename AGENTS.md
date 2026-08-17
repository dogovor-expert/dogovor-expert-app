# Dogovor — правила для агентов

## Обязательное: проверка PDF-экспорта
Нельзя писать «PDF-баг исправлен» без прогона skill `pdf-export-verify` (пункты 1-5: реальные данные, скачивание PDF с прода, программный анализ координат, проверка бандла). Проверка программная, не «на глаз».

## Деплой (Vercel)
- Загрузка идёт из `%LOCALAPPDATA%\Temp\opencode\proj` — перед деплоем синхронизировать: `robocopy /MIR /XD node_modules .git .next e2e test-results coverage .vercel /XF *.md *.log *.pdf <проект> <proj>` и обязательно скопировать свежий `.next` (`robocopy <проект>\.next <proj>\.next /MIR /XD cache`).
- ВНИМАНИЕ: НЕ исключать `*.png` из robocopy — `public/og-image.png` (OG-превью, 1200×630) и `public/apple-icon.png` (iOS-иконка, 180×180) обязаны попасть в деплой. Проверено 17.08.2026: `/XF *.png` в команде синхронизации приводил к 404 на обоих файлах при том, что `og:image`/`apple-touch-icon` ссылаются на них.
- ВАЖНО: `proj` должен содержать ВЕСЬ проект (src, public, конфиги, package.json/lock), а не только `.next` — Vercel запускает реальный `next build` в облаке. Если загрузить только `.next`, билд падает с `missing_pages_app` («Couldn't find any pages or app directory») или `NEXT_NO_VERSION` (нет package.json). Оба проверены 16.08.2026.
- `vercel-finalize.ps1` сам до-загружает `package.json`/`package-lock.json` из исходников и подменяет их sha в манифесте (в `.next` лежит служебный `package.json` — `{"type":"module"}`, билдеру он не подходит; без подмены — `duplicated_file_path`).
- «READY+PROMOTED» НЕ означает доставку кода. Проверять фактически: бандл с прода (маркер `this.y=o.h-i.top`), PDF с прода.
- НЕЛЬЗЯ заливать в деплой папку `.vercel` (и `.vercel/output`): если она попадает в файлы деплоя, Vercel подхватывает её как «prebuilt build artifacts» вместо реальной сборки и сайт отдаёт 404 на всех страницах (проверено 16.08.2026). То же касается `.next/cache` (build-кэш, в рантайме не нужен; большой `0.pack` может уронить загрузку). Синхронизация строго с `/XD .vercel` и `/XD cache`, иначе сайт «умирает».
- `npm run test:prod` — скачивает реальные PDF с прода (e2e/prod-export.spec.ts).

## Тесты
- Unit: `npm run test:unit` (vitest).
- E2E локальные: `npm run test:e2e` (playwright, 3100).
- E2E прод: `npm run test:prod`.

## Личные файлы
Не коммитить и не редактировать: prompt-для-нейросети.md, СКОРО_растаможка.md, на-потом.md (в корне репозитория).