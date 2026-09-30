# Веб-нотариус → раздел «Дополнительные»: исследование и план встраивания

> Статус: исследование завершено, код НЕ трогали. Внедрение — только после
> решения открытых вопросов из §7. Образец интеграции — `/redactor`
> (Smart Redactor): `src/app/redactor/page.tsx` + `redactor-client.tsx` +
> `src/tools/redactor/*` + `ConditionalShell` + `extraNav`.

## 1. Что за приложение (честно)

`D:\Загрузки\Веб-нотариус` — **чисто клиентское React-демо «машины времени
оферт»** (самоназвание Chronoleaf), ~3.6k строк, 12 компонентов, React 19 +
Vite 7 + Tailwind v4 + `pdf-lib`/`pdfjs-dist`/`framer-motion` в зависимостях
(по факту в `src` **не импортируются** — только `lucide-react`).

Экраны (навигация — `useState`, без URL): Dashboard (витрина + живая лента),
CaptureView (вставка URL+текста → SHA-свидетельство), SnapshotView
(слепок + риски + печать/DOC-протокол), DiffView (side-by-side/unified,
word-diff), Timeline (хроника слепков), WatchlistView (карточки с поиском и
фильтрами), AlertsView (лента рисков), HowItWorksView (лендинг + дисклеймер).

Ключевой факт: **все данные вымышлены** — `lib/data.ts` (38 КБ): компании,
URL `*.example`, цифры («9,4 млн слепков», «316 возвратов»). Юрсилы нет
(только SHA-256 + TXT + `window.print()`; ссылка на ФЗ-63 в UI декларативна).
Само приложение это признаёт (дисклеймер в HowItWorksView). Бэкенда, сети,
аккаунтов, крона, уведомлений, оплаты — ноль.

**Рабочее ядро, которое реально полезно:** вставь свой текст →
SHA-256-отпечаток + свидетельство + сравнение версий + протокол. Остальное
(мониторинг маркетплейсов, алерты) — витрина на моках.

## 2. Юридический риск названия (важно)

«Сайт оказывает нотариальные услуги», а нотариат лицензируется. Позиция:
маршрут `/notary` (уже зарезервирован в `ConditionalShell`, менять не надо),
но **пользовательское название — без слова «нотариус»**: «Слепки документов» /
«Мониторинг оферт» / «Фиксация версий». В SEO/title/description — ни слова про
«нотариальное заверение», «юрсилу для суда». Дисклеймер HowItWorksView
сохранить и усилить короткой строкой в свидетельство SnapshotView.
Иначе — претензии за введение в заблуждение.

## 3. Карта портирования (зеркало /redactor)

| # | Действие | Файлы |
|---|----------|-------|
| 1 | Скопировать `src/**` → `src/tools/notary/` (без `main.tsx`, `vite-env.d.ts`, `index.html`) | 19 файлов |
| 2 | CSS: `index.css` → `src/tools/notary/index.css`, переписать под `.notary-root` (правила §4) | 1 файл, ~262 строки |
| 3 | Роут `src/app/notary/page.tsx` (metadata через `withSeo`, `index:true`) | новый |
| 4 | `src/app/notary/notary-client.tsx`: `dynamic(ssr:false)` + `.notary-root` + полоса возврата (копия `redactor-client.tsx`) | новый |
| 5 | `extraNav` в `AppLayout.tsx`: `{ icon: Scale/Gavel, label: «Слепки документов», href: "/notary", badge: "NEW" }` | 1 правка |
| 6 | `ConditionalShell`: уже есть `/notary` — только проверить | 0 правок |
| 7 | `tailwind.config.ts` content: добавить `"./src/tools/**/*.{js,ts,jsx,tsx,mdx}"` (сейчас tools не сканируется!) | 1 строка |
| 8 | `sitemap.ts` + `data-flows.ts`: записи как у redactor | 2 правки |
| 9 | Шрифты: `@fontsource-variable/inter` + `@fontsource/ibm-plex-mono` локально в `notary-client.tsx` (как в redactor) | 0 новых deps |
| 10 | Тест `src/tools/notary/lib/notary.test.ts`: хэш (hash.ts), word-diff инварианты, LCS на фикстурах — логика чистая, в node работает | новый |

Новых npm-зависимостей — **ноль**: все 32 иконки есть в нашем `lucide-react`
0.417 (проверено), остальное не используется. `vite-plugin-singlefile`,
`@tailwindcss/vite`, алиас `@` — выкинуть/не переносить.

## 4. Правила переписывания CSS (главный техриск)

Наш сайт — Tailwind **v3**, нотариус — v4. Порт index.css:

- Удалить `@import "tailwindcss"` (утилиты даёт наш v3).
- `@theme`-токены → CSS-переменные под скопом:
  `.notary-root { --nt-paper: #f5f1e8; --nt-ink: ...; }`, все
  `var(--color-X)` → `var(--nt-X)`. В JSX токен-утилит нет (проверено
  regex-сканом) — конфиг Tailwind **не трогаем**.
- Глобальные селекторы — под скоп (иначе красит весь сайт, как было
  с redactor): `*`→`.notary-root *`, `html,body,#root`→`.notary-root`,
  `body`→`.notary-root`, `button`→`.notary-root button`,
  `:focus-visible`→`.notary-root ...`, `::selection`→`.notary-root ::selection`,
  скроллбары→`.notary-root ::-webkit-scrollbar*`.
- `.chronoleaf-page .diff-block .hairline .paper-card .chip* .mono
  .severity-dot .marquee .gold-underline` + `@keyframes marquee` — префикс
  `.notary-root` (как 531 правило `.redactor-root`).
- `.notary-root { isolation: isolate; color-scheme: light; }` — копия redactor.
- `font-mono` (v3-стек) останется системным — ок, `.mono` покрывает Plex.

JS-порог: `dynamic(ssr:false)` обязателен (`crypto.subtle`, `DOMParser`,
`clipboard`, `window.print`, `Intl` — всё клиентское; в `diff.ts` уже есть
`typeof window`-гард). Внутренний `useState`-роутинг не трогаем (остров
на одной page.tsx), deep-link — non-goal v1.

## 5. Что НЕ заработает в v1 (не обещать)

Реальный захват чужих страниц (CORS), проверки «каждые 6 часов», email/sms/push,
аккаунты и синк, УКЭП/юрсила протокола, тарифы/оплата, живой юрразбор вместо
`risks[]`. CaptureView честно работает только со вставленным текстом —
позиционируем вокруг этого.

## 6. Верификация (по Quality Gate)

`tsc` + `eslint` scoped + `vitest` новый тест; Playwright: `/notary` 1440/390 —
скриншоты Dashboard/Diff/Snapshot, `docSH==vh`, `mainX` чист, таббар/cookie
не перекрывают; проверка изоляции (цвета сайта не поплыли); `?` — lighthouse
по желанию. Коммит `feat(tools)` + деплой по DEPLOY.md.

## 7. Открытые вопросы (решить до внедрения)

1. **Название пункта меню**: ~~«Слепки документов» (рекомендую) / «Мониторинг оферт» / «Веб-нотариус» (не рекомендую — §2)?~~ → **РЕШЕНО: «Контроль оферт»**. Маршрут `/notary` без изменений; SEO/title — без «нотариального заверения» и «юрсилы» (§2 в силе).
2. **Данные**: ~~оставить вымышленный сид как демо (рекомендую для v1) или сразу резать моки и делать «чистый фиксатор вашего текста»?~~ → **РЕШЕНО: оставить сид как демо-витрину**, моки помечены демо; реальные слепки пользователя — позже.
3. **Монетизация v1**: ~~бесплатно всё (рекомендую) или paywall на Diff/протокол (тогда + API/таблица/тариф — отдельная фаза)?~~ → **РЕШЕНО: v1 полностью бесплатно**, без paywall.

## 8. Статус внедрения

**ВНЕДРЕНО и задеплоено** — коммит 15e5fec (28 файлов, 3941 строка), ветка master.

- Шаги 1–10 плана выполнены: src/tools/notary/**, роут /notary, полоса возврата,
  пункт «Контроль оферт» в «Дополнительные», tailwind content-глоб,
  sitemap, data-flows, шрифты локально в клиенте.
- CSS портирован под .notary-root: токены под префиксом --color-* внутри корня,
  глобальные селекторы и keyframes префиксованы, @import tailwindcss/@theme удалены.
- Исправлены по ходу: grid-blowout на мобильных (4 файла), вложенные <a>
  в полосе возврата (гидратация) — там же попутно почищен /redactor.
- Верификация: tsc 0, eslint 0, vitest 11/11, Playwright 1440+390 — mainX чист,
  docSH без пустот, JS-ошибок нет; в проде /notary → 200 с корректным title,
  маркеры контента найдены, скриншоты в udit/resume-audit/notary-shots/prod-*.png.
- Зависимости не добавлялись — используются существующие lucide-react/react/pdf-tools.
