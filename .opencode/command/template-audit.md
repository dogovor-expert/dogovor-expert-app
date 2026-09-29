---
description: Полный аудит юридических шаблонов и связей по правилам AGENTS.md
---

Выполни глубокий аудит шаблонов проекта:
1. Запусти `npx vitest run src/data/__tests__/templates.test.ts` (счётчик шаблонов 570, валидность `suggestedDocs`, совпадение `TEMPLATE_COUNT`).
2. Выполни `npx vitest run src/lib/__tests__/docScanner.test.ts` (проверка ролей, слотов и маппинга сканера).
3. Запусти `npx vitest run src/lib/__tests__/docDesign.test.ts` (проверка стилевых токенов и верстки).
4. Запусти `npx vitest run src/lib/__tests__/renderDocument.test.ts` (проверка рендерера и экранирования).
5. Сформируй итоговый краткий статус аудита.
