# Бенчмарк инструментов: текущее состояние vs enterprise-уровень

**Дата:** 31.08.2026
**Объект:** `D:\Мои сайты\site Dogovor`
**Метод:** изучение каждого инструмента/скрипта/CI отдельно + сравнение с индустриальными best-practices (Stripe/Linear/Vercel/Supabase/GitHub Actions/Playwright). Только анализ, правки не вносились.

---

## 0. Общая картина
- **25 скриптов** `scripts/` — смесь диагностики, генераторов, крипто-тестов, чистки. Большинство ручные, **не в CI**.
- **Тесты:** Vitest (23 файла) + Playwright (4 spec + 1 a11y). **CI не запускает ни юнит-, ни e2e-тесты.**
- **CI:** один workflow `sync-check.yml` — только `npm ci → build → check-template-sync`. Нет lint/typecheck/unit/e2e/security/deploy.
- **coverage/**: локальный HTML v8, заигнорен, без threshold, не публикуется.
- **Секреты:** заигнорены, но `live`-ключи и статичный `VERCEL_OIDC_TOKEN` лежат на диске в открытом виде.
- **Observability:** отсутствует (нет Sentry/OTel; `error.tsx` лишь `console.error`).
- **a11y:** axe-спек WCAG 2.2 AA есть, но не в CI.

---

## 1. `scripts/` — разбор по категориям

### А. Диагностика страниц (ручные зонды)
| Скрипт | Оценка | Статус | Гэп vs профи |
|---|---|---|---|
| `diag-all-pages.mjs` | 6/10 | alive | Ручной; нет `expect`-ассертов/трейсов/CI; «шум» захардкожен → переписать в `e2e/*.spec.ts` с трейсами |
| `diag-yandex-connect.mjs` | 5/10 | alive | Скриншот в `C:/Users/.../opencode` (непортативно), хрупкие `:has-text(...)` селекторы → `data-testid` |
| `diag-guides.mjs` | 5/10 | alive | Тривиальный зонд без ассертов/exit-кода |
| `check-osago-widget.mjs` | 5/10 | alive | Нет exit-кода/ассерта; зондит живой прод |
| `check-proto.mjs` | 3/10 | **вероятно устарел** | Ссылается на concept-HTML вне репо |
| `check-redesign.mjs` | 3/10 | **вероятно устарел** | Аналогично |
| `preview-menu.mjs` | 4/10 | сомнительно | Завязан на dev-only `/dev-menu` |
| `browse-demo.mjs` | 5/10 | alive | Демо-тул, не автоматизируемый |
| `builder-print-verify.mjs` | 5/10 | alive | Ручной; PDF в temp |
| `preview-verify.mjs` | 4/10 | alive | Почти ничего не проверяет |
| `print-verify.mjs` | 6/10 | alive | Полезно, но ручное |
| `hydracap.mjs` | 4/10 | alive | Generic, ничего не сохраняет |
| `chromium-wrapkey-probe.mjs` | 3/10 | **устарел** | Исследование `wrapKey`, от которого отказались |

**Эталон:** диагностика = Playwright-спеки внутри раннера (`expect`, `trace:'on-first-retry'`, HTML+JUnit репорты, `retries:2`, параллельные `workers`), запуск в CI на **preview-деплое** каждого PR, результаты в GitHub Checks/Slack.

### Б. Крипто-ядро vault
| Скрипт | Оценка | Статус | Гэп |
|---|---|---|---|
| `vault-crypto-test.mjs` | 8/10 | alive | Отличный охват, **но вне раннера** → перенести в Vitest (`node`) |
| `vault-e2e.mjs` | 6/10 | alive | Ценные проверки, но ручной → `e2e/vault.spec.ts` + CI |

**Эталон:** чистая крипто-логика → Vitest (быстро, детерминированно, покрытие); IDB/браузер → Playwright-спек с трейсом в CI.

### В. Генераторы (идемпотентные)
| Скрипт | Оценка | Статус | Гэп |
|---|---|---|---|
| `generate-templates-meta.mts` | 8/10 | alive | Чисто, не в CI → добавить `generate:meta` до build |
| `generate-signing-meta.mts` | 7/10 | alive | Хрупкие регэкспы по HTML, не в CI |
| `generate-blank-previews.mts` | 8/10 | alive | Тяжёлый (≈369 PDF), **нет кэша/артефакта** в CI → отдельный job + cache; или runtime-генерация |

**Эталон:** генераторы метаданных — CI-шаг «generate or verify» (как уже сделано для `check-template-sync`); превью бланков как build-time asset (паттерн Next static/ISR + генерируемые OG).

### Г. Чистка / одноразовые миграции
| Скрипт | Оценка | Статус | Гэп |
|---|---|---|---|
| `split-templates.mjs` | 4/10 | **мёртв** | Исходник заменён заглушкой → удалить |
| `fix-contrast.js` | 4/10 | **мёртв** | Уже применён (no-op) → удалить; контраст закрепить линтером/темой + axe CI |

### Д. Аудит данных и CI-гейт
| Скрипт | Оценка | Статус | Гэп |
|---|---|---|---|
| `audit-actsource.mjs` | 7/10 | alive | Качественный data-lint, **не в CI** → добавить рядом с sync |
| `check-template-sync.mts` | 9/10 | **в CI ✅** | Эталонный паттерн; расширить на другие гейты |

### Е. SEO / интеграции
| Скрипт | Оценка | Статус | Гэп |
|---|---|---|---|
| `indexnow.mjs` | 5/10 | alive | Ключ `KEY` **захардкожен**; бьёт в живой прод → post-deploy CI-step, ключ из секрета |
| `setup-telegram-webhook.mjs` | 7/10 | alive | One-shot, читает `.env.local` → в CI с Vercel Env |

### Ж. OCR
| Скрипт | Оценка | Статус | Гэп |
|---|---|---|---|
| `ocr-test.mts` | 6/10 | alive | Полезно, **вне Vitest** → `src/lib/__tests__/ocr.test.ts` |

---

## 2. Тесты (Vitest + Playwright)
- **Vitest:** 23 файла, `environment: jsdom`, v8 coverage, **threshold НЕ задан**. Содержание 6/10, интеграция 2/10.
- **Playwright:** 15 проектов, `fullyParallel:false`, `workers:1`, `trace: retain-on-failure` — хорошие дефолты. Но **не в CI**, нет `retries`/`--shard`/parallel. `responsive.spec.ts` ≈ 75 браузерных тестов (раздуто).
- **Эталон (пирамида):** Unit (Vitest, fast) >> Integration (API/Supabase/Redis) >> E2E (Playwright, минимум критичных путей). Здесь e2e доминирует, integration-слой отсутствует. Playwright best: `retries:2`, `--shard`, `workers` по ядрам, репорты `github`+`junit`, `trace:'on-first-retry'`.

---

## 3. CI (`.github/workflows/`)
- Только `sync-check.yml`: checkout → setup-node(22) → `npm ci` → `build` → `npx tsx check-template-sync`. `engines.node=24` ≠ CI 22. **Оценка 3/10.**
- **Эталон (GitHub Actions best):** `lint` → `typecheck (tsc --noEmit)` → `unit+coverage` (Codecov, threshold) → `build` (cache) → `e2e` (sharded, против Vercel preview) → `security` (CodeQL, gitleaks, Dependabot) → `preview deploy` → `prod deploy` (OIDC, manual approval). Кэш npm + Playwright-браузеров.

---

## 4. `coverage/`
Локальный HTML v8, заигнорен, без threshold. **3/10.** Эталон: Codecov/SonarCloud + PR-comментарий (patch delta) + обязательные `thresholds` (fail build ниже 80%).

---

## 5. `next.config.mjs`
- ✅ Хорошо: `splitChunks` (tesseract/pdf-lib/docx/pdfjs/fontkit async; lucide/date-fns) — реальная забота о бандле; строгий CSP, HSTS preload, Permissions-Policy, Referrer-Policy. **7/10.**
- Гэп: `bundle-analyzer` только вручную (`ANALYZE=true`). Эталон: analyzer как артефакт в CI + **`size-limit`** + **Lighthouse CI** с бюджетами.

---

## 6. Секреты / окружение
- Заигнорены (проверено `git check-ignore`), но `.env.local` содержит `live_` YooKassa, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, а `vercel.env` — **статичный `VERCEL_OIDC_TOKEN`**. **4/10.**
- Эталон: локально test-mode (не `live_`); прод-ключи только в Vercel Env/Doppler; **OIDC на лету в CI, без статичного токена в файле**; ротация; `gitleaks` в CI как блокирующий шаг.

---

## 7. Мониторинг / observability
По `src` на `@sentry`/`@opentelemetry`/`datadog`/`posthog` — **0 совпадений**. `error.tsx` только `console.error`. **1/10.**
- Эталон: `@sentry/nextjs` + `instrumentation.ts`; `error.tsx` → `Sentry.captureException`; session replay, RUM, alerts в Slack; OTel для трейсов API→Supabase; структурированный логгер (pino/winston) с correlation ID.

---

## 8. a11y
- `e2e/a11y/accessibility.spec.ts`: axe WCAG 2.2 AA, 12 страниц × desktop/mobile = 24 теста. **Содержание 7/10, интеграция 2/10** (не в CI).
- Эталон: axe = **блокирующий шаг CI**; + Lighthouse CI с бюджетами; гейты `prefers-reduced-motion`, keyboard-nav, focus-management.

---

## Итоговая таблица
| Инструмент | Сейчас | Эталон | Приоритет |
|---|---|---|---|
| `diag-*.mjs` (7) | Ручные зонды | Playwright-спеки + трейсы + CI | Высокий |
| `vault-crypto-test.mjs` | Node вне раннера | Vitest + CI | Средний |
| `vault-e2e.mjs` | Ручной PW | `e2e/vault.spec.ts` + CI | Средний |
| `generate-*-meta.mts` | Идемпотентны, не в CI | CI до build | Средний |
| `generate-blank-previews.mts` | Тяжёлый, без кэша | Job + cache/artifact | Средний |
| `split-templates.mjs` / `fix-contrast.js` | Мёртвые | Удалить | Низкий |
| `audit-actsource.mjs` | data-lint, не в CI | Блок CI | Высокий |
| `check-template-sync.mts` | В CI ✅ | Эталон | — |
| `indexnow.mjs` | Ключ в коде | Post-deploy CI + секрет | Средний |
| `ocr-test.mts` | Вне Vitest | Vitest | Средний |
| `check-proto/redesign/preview-menu/wrapkey` | Устарели | Удалить/перенести | Низкий |
| Vitest | 23 файла, нет threshold | + thresholds + Codecov + integration | Высокий |
| Playwright | 100+ тестов, нет CI | Shards+retries+parallel+preview | Высокий |
| `responsive.spec.ts` | ~75 тестов | Урезать/visual-regression | Средний |
| CI | 1 workflow, build+sync | Полный пайплайн + Dependabot/CodeQL/gitleaks | Критический |
| `coverage/` | Локально | Codecov + thresholds | Средний |
| `next.config.mjs` | splitChunks ✅, ANALYZE ручной | size-limit + analyzer CI + Lighthouse CI | Средний |
| Секреты | Заигнорены, но live+OIDC в файле | Vercel Env/Doppler + ротация + gitleaks | Критический |
| Observability | Нет | Sentry + instrumentation + логгер | Критический |
| a11y | axe-спек есть, не в CI | axe blocking + Lighthouse CI | Высокий |

---

## Что уже на уровне профи (подтверждено)
1. Секреты не коммитятся (`.gitignore` корректен).
2. `check-template-sync.mts` уже блокирующий CI-гейт (generated-artifact-sync).
3. Сильные security-заголовки (CSP, HSTS preload, Permissions-Policy, Referrer-Policy, X-Content-Type-Options).
4. Разумный `splitChunks` (тяжёлые либы в async-чанки).
5. Playwright-конфиг с трейсами/скриншотами + матрицей вьюпортов.
6. a11y axe-спек WCAG 2.2 AA (содержательно enterprise-уровень).
7. Идея «превью бланков = тот же движок что PDF» (статичные ассеты, SEO/perf).
8. Продуманный крипто-тест vault (round-trip, tamper, ZK-share).
9. Современный стек (Next 15.5 + React 19 + strict + TS; Testing Library/axe/vitest уже есть).
10. Data-lint `audit-actsource.mjs` (готов стать CI-гейтом).

---

## Топ-10 действий для enterprise-уровня
1. **Полный CI-пайплайн** (`ci.yml`): lint → typecheck → unit+coverage → build → e2e(sharded) → security → preview → prod. + Dependabot/CodeQL/gitleaks.
2. **Блокирующие гейты в CI**: `audit:acts`, `check-template-sync`, axe, unit.
3. **Observability**: `@sentry/nextjs` + `instrumentation.ts`; `error.tsx` → `Sentry.captureException`; структурированный логгер; алерты.
4. **Секреты**: Vercel Env/Doppler; локально test-mode; **удалить `VERCEL_OIDC_TOKEN` из `vercel.env`**; ротация; gitleaks в CI.
5. **Бандл**: `size-limit` + analyzer-артефакт CI + Lighthouse CI с бюджетами.
6. **E2E-оптимизация**: `retries:2`, `--shard`, `workers` по ядрам, репорты `github`+`junit`; урезать `responsive.spec.ts`; добавить integration-слой для `app/api/*`.
7. **Покрытие**: Codecov + `coverage.thresholds` + PR-comментарий; удалить локальный `coverage/`.
8. **Перенос автономных тестов**: vault-crypto→Vitest, ocr→Vitest, vault-e2e→`e2e/vault.spec.ts`; диагностические зонды → `e2e/diag/*.spec.ts`.
9. **Чистка мёртвых скриптов**: удалить `split-templates.mjs`, `fix-contrast.js`, проверить/удалить `check-proto`, `check-redesign`, `preview-menu`, `chromium-wrapkey-probe`; `indexnow`/`setup-telegram-webhook` → post-deploy CI.
10. **Процесс**: conventional commits + semantic-release/CHANGELOG; защита `main` с required checks; pre-commit (lint-staged + husky) для генераторов; синхронизировать `engines.node` (24) и CI (22).

*Детальный отчёт агента сохранён в истории сессии. Данный файл — сводка для принятия решений по инфраструктуре.*
