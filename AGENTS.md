# Dogovor — правила для агентов

## Обязательное: проверка PDF-экспорта
Нельзя писать «PDF-баг исправлен» без прогона skill `pdf-export-verify` (пункты 1-5: реальные данные, скачивание PDF с прода, программный анализ координат, проверка бандла). Проверка программная, не «на глаз».

## Деплой (Vercel)
- Загрузка идёт из `%LOCALAPPDATA%\Temp\opencode\proj` — перед деплоем синхронизировать: `robocopy /MIR /XD node_modules .git .next e2e test-results coverage .vercel /XF *.md *.log *.png *.pdf <проект> <proj>` и обязательно скопировать свежий `.next` (`robocopy <проект>\.next <proj>\.next /MIR /XD cache`).
- «READY+PROMOTED» НЕ означает доставку кода. Проверять фактически: бандл с прода (маркер `this.y=o.h-i.top`), PDF с прода.
- НЕЛЬЗЯ заливать в деплой папку `.vercel` (и `.vercel/output`): если она попадает в файлы деплоя, Vercel подхватывает её как «prebuilt build artifacts» вместо реальной сборки и сайт отдаёт 404 на всех страницах (проверено 16.08.2026). То же касается `.next/cache` (build-кэш, в рантайме не нужен; большой `0.pack` может уронить загрузку). Синхронизация строго с `/XD .vercel` и `/XD cache`, иначе сайт «умирает».
- `npm run test:prod` — скачивает реальные PDF с прода (e2e/prod-export.spec.ts).

## Тесты
- Unit: `npm run test:unit` (vitest).
- E2E локальные: `npm run test:e2e` (playwright, 3100).
- E2E прод: `npm run test:prod`.

## Личные файлы
Не коммитить и не редактировать: prompt-для-нейросети.md, СКОРО_растаможка.md, на-потом.md (в корне репозитория).