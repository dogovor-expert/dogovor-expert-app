# QUALITY GATE: Барьер против Codebase Rot

> Вынесено из AGENTS.md (2026-09-05). Причина: раздувало основной файл, барьер заслуживает отдельного документа.

Главная проблема агентной разработки — ИИ мыслит локально и не видит скрытых связей. Один правленный файл ломает десять потребителей. Чтобы разорвать цикл, в проекте внедрены **жёсткие автоматические барьеры**.

## Шаг 1. Анализ радиуса поражения (BLAST RADIUS) — ОБЯЗАТЕЛЕН

Перед редактированием любого файла X агент **ОБЯЗАН** явно выполнить:

```bash
node scripts/check-blast-radius.mjs <path/to/X>
# или для staged:
node scripts/check-blast-radius.mjs --staged
```

Скрипт найдёт **всех потребителей** через grep по `from '...X'` / `import('...X')` / `require('...X')` / упоминаниям в типах. В плане работ агент ОБЯЗАН явно перечислить:

- Файл, который меняется
- Список ВСЕХ потребителей (вывод скрипта)
- Как именно изменение повлияет на каждого потребителя

**Запрет на изменение контрактов:** не менять сигнатуру (props/args) и тип возврата без явного согласования. Новые параметры — только опциональные (`param?: Type`).

## Шаг 2. vitest related (ТОЛЬКО зависимые тесты)

```bash
npx vitest related <измененный_файл> --run
```

Запускает **только** тесты, импортирующие изменённый файл (напрямую или через цепочку). Если агент сломал контракт — красные тесты появятся мгновенно, до коммита.

Использовать ПОСЛЕ каждой правки:

```bash
npx vitest related src/lib/useCookieConsent.ts --run
npx vitest related src/components/builder/BuilderPage.tsx --run
```

## Шаг 3. TypeScript strict (`npx tsc --noEmit`)

`tsconfig.json` уже включён `"strict": true` + `"noImplicitAny": true`. **КРИТИЧНО:** запускать `npx tsc --noEmit` после ЛЮБОЙ правки. Ошибка в потребителе — даже если агент этот файл не открывал — будет поймана компилятором.

## Шаг 4. Smoke-тесты (5 базовых сценариев)

`e2e/smoke.spec.ts` — 5 несменяемых сценариев:

1. Главная: 200 + title + h1
2. Каталог `/templates`: 200 + ≥1 карточка
3. `/builder`: 200 + форма
4. 404: статус 404 на несуществующей странице
5. Cookie consent: баннер виден, localStorage сохраняется

Запуск:

```bash
npm run check:smoke         # на localhost
npm run check:smoke:prod    # на https://dogovor.expert
```

**Правило:** если после правок падает хоть один smoke — изменения бракованы.

## Шаг 5. Модульная изоляция (Open-Closed в действии)

Каждый публичный модуль имеет `index.ts` — единственная точка входа снаружи. Внутренности (`api/`, `components/`, `utils/`) нельзя импортировать напрямую.

**Примеры модулей с изоляцией:**

- `src/lib/seo/` → `import { withSeo } from '@/lib/seo'`
- `src/lib/cookies/` → `import { useCookieConsent } from '@/lib/cookies'`
- `src/lib/pricing/` → `import { currentProPrice } from '@/lib/pricing'`

Если модуль не имеет `index.ts` — **создать его** (аудит 2026-09-05). В активной работе: рефакторинг `src/lib` в features-style.

## 🎯 ФИНАЛЬНЫЙ ЧЕК-ЛИСТ ПЕРЕД СДАЧЕЙ

Агент НЕ ИМЕЕТ ПРАВА отчитываться о выполнении, пока **последовательно** не выполнит:

- [ ] **Blast radius:** `node scripts/check-blast-radius.mjs <изменённые>` — все потребители перечислены
- [ ] **TypeScript:** `npx tsc --noEmit` → 0 ошибок
- [ ] **vitest related:** `npx vitest related <изменённые> --run` → все зелёные
- [ ] **Unit suite:** `npm run test:unit` → 0 падений
- [ ] **Smoke (опционально):** `npm run check:smoke:prod` если менялся публичный API
- [ ] **Build:** `npm run build` → нет ошибок
- [ ] **Browser console:** нет Uncaught Error / CSP Violation

## Pre-commit hook (автоматический барьер)

`.husky/pre-commit` запускает перед КАЖДЫМ коммитом:

1. `npx tsc --noEmit` — TypeScript
2. `npm run lint` — ESLint
3. `node scripts/check-blast-radius.mjs --staged` — blast radius
4. `npx vitest related` — для первого staged `.ts`/`.tsx` файла
5. `node scripts/check-secrets.mjs` — gitleaks: секреты в staged-файлах (warning-пропуск, если gitleaks не установлен)

Если что-то падает — коммит отменяется. Обход только через `git commit --no-verify` (для экстренных случаев, см. CHANGELOG).