# Адаптивность — регламент и инварианты (2026-09)

> Цель: сайт корректно работает на любых устройствах/браузерах/разрешениях.
> Этот документ — источник правил для AI-агентов при работе с UI. См. также `docs/INVARIANTS.md`, `src/components/AGENTS.md`.
>
> ⛔ **PWA / «сайт как приложение» / service worker — НЕ внедрять.** Решение владельца: отложено.
> Не добавлять SW, install-баны, манифест-иконки PNG и прочее из этой темы без явного запроса.

## 0. Что уже настроено (среда адаптивности)

- `src/app/layout.tsx`: `export const viewport` — `width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content`, `themeColor=#4f46e5`, `colorScheme=light`.
- `src/styles/globals.css`: `100dvh` с vh-фолбэком (`body`); `overflow-x:hidden` снят (после локализации реальных overflow); `.pb-safe` (env safe-area-bottom) для fixed-панелей; `.touch-target` 44×44; `text-display-xl/lg/md` fluid-классы (clamp, rem-компонент).
- `src/hooks/useVisualViewport.ts`: visualViewport-хук для iOS-клавиатуры (Safari без interactive-widget); применён в builder/form как padding-bottom.
- `src/components/layouts/MobileTabBar.tsx`: 5-раздел нижняя таб-панель (<lg), safe-area-bottom, авто-скрытие при скролле вниз, скрытие при фокусе в input, бейдж черновиков; скрыта на /admin, /builder/export-pdf, /login, /signup.
- `tailwind.config.ts`: плагин `@tailwindcss/container-queries`; пример контейнерных запросов в `HomeTemplateGrid.tsx` (`@container/templates` + `@md:@xl:@3xl:`).
- `playwright.config.ts`: мобильные touch-проекты `mobile-chromium-pixel7` (Chromium) и `mobile-webkit-iphone14` (WebKit) — testMatch только `responsive.spec.ts`.
- `e2e/responsive.spec.ts`: стражи viewport meta + отсутствие горизонтального скролла на /login, /templates, /documents/[slug] + существующие проверки 5 страниц × 5 вьюпортов; тач-таргет-канарейка поднята на 44px; новый блок `Mobile tab bar (<lg / ≥1024px)` — 3 проверки (видимость/скрытие/исключения).

## 1. Текущее состояние (аудит кодовой базы)

| Факт | Оценка |
|---|---|
| Tailwind v3.4, дефолтные брейкпоинты sm/md/lg/xl | sm:×142, md:×26, lg:×62, xl:×6 — смещено к sm, md недоиспользован |
| `100vh` — 1 место (`globals.css` body min-height) | заменить на `100dvh` с фолбэком |
| `dvh/svh/lvh` — 0 | внедрять |
| `env(safe-area-inset-*)` — 0 | внедрять (вырезы iOS в мобильном Safari) |
| `html,body { overflow-x: hidden }` | маскирует баги переполнения, не лечит; после исправления реальных overflow снять |
| `@media (max-width:640px) input{16px}` | ✅ правильно (iOS zoom на <16px) |
| `.touch-target` 44×44 | ✅ есть, но e2e-страж проверял только ≥24px — поднять планку |
| A4-листы документов (`.sheet`) | фиксированная ширина — проверять контейнерный скролл на <420px |

## 2. Стандарты адаптивности 2026

### 2.1 Четыре слоя responsive-дизайна
1. **Media queries** — только для структурных изменений страницы (навигация, раскладка shell).
2. **Container queries** — для компонентов (карточки, сайдбар билдера, таблицы в панелях). Baseline Widely available (авг. 2025, ~93% поддержки). В Tailwind v3.4 — через `@tailwindcss/container-queries` плагин. Ограничения: контейнер не может запрашивать себя (нужен wrapper); `container-type: inline-size` включает size containment (может ломать flex-children без ширины); CSS-переменные НЕ работают в условии `@container (min-width: var(--x))`; grid-item — плохой контейнер (оборачивать).
3. **clamp() fluid type/spacing** — плавная типографика без скачков брейкпоинтов. Правила доступности: всегда включать `rem`-компонент (zoom до 200%, W3C F94 — чистые vw-размеры = fail), max ≤ 2.5×min.
4. **Intrinsic layout** — `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, flex-wrap — там, где брейкпоинты вообще не нужны.

### 2.2 Вьюпорт и мобильные браузеры
- `vh` привязан к layout viewport → на iOS `100vh` больше видимой области. Использовать `dvh` (текущий), `svh` (с барами), `lvh`. Фолбэк: `min-height: 100vh; min-height: 100dvh;`.
- Виртуальная клавиатура: Android 108+ — `interactive-widget=resizes-content` (уже в meta) + `dvh` достаточно. **iOS Safari не поддерживает interactive-widget** — единственный кросс-платформенный механизм — `window.visualViewport` (resize/scroll события) для полей билдера на мобильных.
- `viewport-fit=cover` уже в meta → `env(safe-area-inset-*)` доступны. Фиксированные нижние панели: `padding-bottom: calc(1rem + env(safe-area-inset-bottom))`.
- iOS scroll restoration ломается при динамическом изменении высоты до mount — не менять высоту контента до `onScroll` без нужды.
- Таблицы данных: паттерн — горизонтальный скролл + sticky первая колонка (`sticky left-0 bg-white`) + `min-w-[640px]` + тень-подсказка скролла; либо приоритизация колонок (`hidden md:table-cell`); либо карточки на <sm.
- Тач-таргеты: минимум 44×44 (Apple HIG) / 24 CSS-px абсолютный floor (WCAG 2.2 AA 2.5.8) — наш стандарт 44 для основных действий.
- `100dvh` + `overflow:hidden` для модалок; `overscroll-behavior: contain` для внутренних скролл-зон (листать документ внутри билдера — не «вытягивать» страницу).
- `scrollbar-gutter: stable` где layout сдвигается из-за скроллбара (desktop).
- `prefers-reduced-motion` — приглушать анимации; `prefers-color-scheme` — пока light-only, держать в метаданных.

### 2.3 Кросс-браузерные особенности (Chrome/Edge, Firefox, Safari macOS/iOS, Яндекс/Atom, VK)
- WebKit (iOS/Safari): нет `interactive-widget`; sticky-элементы внутри `overflow-x:hidden` ancestors могут ломаться; `position:fixed` + открытая клавиатура — сдвиг; `-webkit-fill-available` как легаси-фолбэк dvh.
- Firefox: `dvh` с v101; `scrollbar-width: thin` вместо псевдоэлементов.
- Chromium-основанные (Яндекс, Atom, VK): ведутся как Chrome, но Яндекс.Браузер на Android имеет свой рендер-режим — проверять реальные скриншоты.
- ResizeObserver — базово доступен везде; использовать для «прилипаний» превью A4.

## 3. Правила для агентов (инварианты адаптивности)

1. Новые компоненты — **mobile-first** классы (`base` = мобильный, `sm:`+ = улучшения). Не писать `max-width` медиазапросы в Tailwind-стиле.
2. Компонент, который живёт в разных контейнерах (сайдбар/модалка/полная ширина) — **container queries**, не viewport-брейки.
3. Типографика крупная (h1/h2 hero) — `clamp()` с rem-компонентом; запрещены чистые vw-размеры шрифта.
4. Высота вьюпорта — только `dvh/svh/lvh` с vh-фолбэком. `100vh` в новом коде — error на review.
5. Любые fixed-панели снизу/сверху — `env(safe-area-inset-*)` паддинги.
6. Поля ввода на мобильных ≥16px font-size (уже в globals), `inputmode`/`autocomplete` обязательны.
7. Таблицы: sticky-колонка + min-width + подсказка скролла; не давать колонкам сжиматься ниже читаемого.
8. Не расширять `overflow-x: hidden` на новые элементы — чинить причину переполнения.
9. Перед сдачей UI-задачи: `npx playwright test e2e/responsive.spec.ts --project=mobile-chromium-pixel7 --project=mobile-webkit-iphone14` + ручная проверка 320px (iPhone SE 1-го поколения floor).
10. Тесты-стражи в `responsive.spec.ts` не ослаблять (порог скролла, viewport meta).
11. **Service worker / PWA-инсталляция — не трогать** (см. шапку документа).

## 4. План внедрения (следующие сессии)

- [x] R1: `100vh`→`dvh` в globals.css; убрать `overflow-x:hidden` после локализации реальных overflow (прогнать responsive e2e с логом «элементы за краем»)
- [x] R2: safe-area паддинги для fixed-панелей — `.pb-safe` утилита в globals.css; применена к SupportLauncher, CookieBanner, FeedbackModal
- [x] R3: visualViewport-хелпер для полей билдера (клавиатура iOS) — `src/hooks/useVisualViewport.ts` + keyboardInset-паддинг формы в builder/page.tsx
- [x] R4: clamp() для hero/display-типографики — `text-display-xl/lg/md` утилиты (W3C F94: rem-компонент, max ≤ 2.5×min); применены на главной, /billing, /autoteka, /blanks
- [x] R5: таблицы дашборда/админки — sticky-first-column паттерн (отложено, см. ниже)
- [x] R6: нижняя таб-панель для мобильных (<lg) — `src/components/layouts/MobileTabBar.tsx`, 5 разделов (Главная/Шаблоны/Создать/Документы/Профиль), safe-area-bottom, авто-скрытие при скролле вниз, скрытие при фокусе в input, бейдж черновиков; e2e-страж `Mobile tab bar (<lg / ≥1024px)`
- [x] R3-cq: container queries — установлен `@tailwindcss/container-queries`, зарегистрирован в tailwind.config.ts, `@container/templates` + `@md:@xl:@3xl:` в `HomeTemplateGrid.tsx`

## 5. Источники (проверено 07.09.2026)

- Scrimba RWD Guide 2026 (container queries baseline Aug 2025, clamp/dvh правила, W3C F94)
- arturbasak.dev — layout vs visual viewport, interactive-widget матрица браузеров
- web.dev — safe-area-insets, dvh, overscroll-behavior
- jamesrossjr.com — responsive data tables (sticky column, приоритизация)
- Tailwind CSS docs — container queries plugin (v3.4)
