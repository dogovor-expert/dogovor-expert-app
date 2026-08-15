# Dogovor — правила для агентов

## Обязательное: проверка PDF-экспорта
Нельзя писать «PDF-баг исправлен» без прогона skill `pdf-export-verify` (пункты 1-5: реальные данные, скачивание PDF с прода, программный анализ координат, проверка бандла). Проверка программная, не «на глаз».

## Деплой (Vercel)
- Загрузка идёт из `%LOCALAPPDATA%\Temp\opencode\proj` — перед деплоем синхронизировать: `robocopy /MIR /XD node_modules .git .next e2e test-results coverage .vercel /XF *.md *.log *.png *.pdf <проект> <proj>` и обязательно скопировать свежий `.next` (`robocopy <проект>\.next <proj>\.next /MIR /XD cache`).
- «READY+PROMOTED» НЕ означает доставку кода. Проверять фактически: бандл с прода (маркер `this.y=o.h-i.top`), PDF с прода.
- `npm run test:prod` — скачивает реальные PDF с прода (e2e/prod-export.spec.ts).

## Тесты
- Unit: `npm run test:unit` (vitest).
- E2E локальные: `npm run test:e2e` (playwright, 3100).
- E2E прод: `npm run test:prod`.

## Личные файлы
Не коммитить и не редактировать: prompt-для-нейросети.md, СКОРО_растаможка.md, на-потом.md (в корне репозитория).