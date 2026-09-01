---
description: Полный аудит юридических шаблонов и связей по правилам AGENTS.md
---

Выполни глубокий аудит шаблонов проекта:
1. Запусти `npx vitest run src/lib/__tests__/templates.test.ts` (проверка общего счетчика шаблонов, ожидается 369).
2. Выполни `npx vitest run src/lib/__tests__/docScanner.test.ts` (проверка ролей, слотов и маппинга сканера).
3. Запусти `npx vitest run src/lib/__tests__/docDesign.test.ts` (проверка стилевых токенов и верстки).
4. Запусти `npx vitest run src/lib/__tests__/renderDocument.test.ts` (проверка рендерера и экранирования).
5. Сформируй итоговый краткий статус аудита.
