# Changelog

Все заметные изменения в проекте документируются здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
этот проект придерживается [Semantic Versioning](https://semver.org/lang/ru/).

> **Автогенерация:** release-please автоматически создаёт PR с обновлением
> `package.json` версии + этого файла. См. `.github/workflows/release-please.yml`.

## [Unreleased]

### Features
- Granular cookies consent (GDPR Art. 7(2)): категории necessary/analytics/marketing
- Persistent иконка 🍪 для отзыва согласия
- 3 равноправные кнопки: «Принять всё», «Только необходимые», «Настроить»
- A11y: Escape, focus-trap, autoFocus, aria-live в cookies-баннере

### Bug Fixes
- YandexMetrikaPageView: теперь реагирует на accept без перезагрузки страницы

### CI/CD
- BLAST RADIUS протокол: `scripts/check-blast-radius.mjs` для поиска зависимостей
- vitest related: тесты только для изменённых файлов
- Smoke-тесты: 5 базовых сценариев жизнеспособности сайта
- Pre-commit: typecheck + lint + blast radius + vitest related

### Documentation
- Стандарт agents.md (Linux Foundation)
- Вложенные AGENTS.md: src/lib/supabase, src/components, src/app/api, src/app/admin
- IDE-обёртки: CLAUDE.md, .cursorrules, .clinerules, .windsurfrules, .github/copilot-instructions.md
- ADR-шаблоны в `docs/adr/`
