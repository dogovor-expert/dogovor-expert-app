# Цели Яндекс.Метрики для счётчика 111811597

Код отправляет цели через `ym(ID, 'reachGoal', target)` (см. `src/lib/analytics.ts`).
Для каждой цели ниже нужно создать в интерфейсе Метрики цель типа
**«Целевое событие»** с указанным идентификатором. Без создания в UI
события не попадут в отчёт «Конверсии».

Лимиты: до 200 целей на счётчик, фиксация одной цели не чаще 1 раза/сек.

## Воронка конструктора

| Идентификатор | Событие | Params | Где в коде |
|---|---|---|---|
| `builder_start` | Открытие шаблона в билдере (первый шаг воронки) | `template` (id), `source` (`url`/`catalog`) | `builder/page.tsx` — tryOpenFromUrl, onSelectTemplate |
| `export_pdf` | Скачивание PDF | `template`, `pack` (bool) или `source` (`paywall_free`/`export-page`) | `builder/page.tsx` handleExportPdf, PaywallModal, `builder/export-pdf/page.tsx` |
| `export_docx` | Экспорт DOCX (только PRO) | `template`, `pack` (bool) | `builder/page.tsx` handleExportDocx |
| `export_email` | Отправка документа на email | `template` | `builder/page.tsx` handleSendEmail |
| `paywall_shown` | Показ пейволла (упущенная конверсия) | `reason` (title гейта) | `builder/page.tsx` requirePro |

## Монетизация

| Идентификатор | Событие | Params | Где в коде |
|---|---|---|---|
| `payment_created` | Создан платёж YooKassa (уход на оплату) | — | `billing/page.tsx` pay() |
| `payment_success` | Успешный платёж (return success) | — | `billing/page.tsx` useEffect success |
| `billing_autorenew_toggle` | Вкл/выкл автопродление | `enabled` (bool) | `billing/page.tsx` toggleAutoRenewal |
| `autoteka_order_start` | Заказ отчёта Автотеки | `tariff` (`std`/`prem`) | `autoteka/AutotekaClient.tsx` handlePay |

## Воронка для отчёта «Конверсии»

```
builder_start → export_pdf/export_docx → payment_created → payment_success
```

Дополнительно контролировать: `paywall_shown` / `builder_start` — доля
упёршихся в гейт; `autoteka_order_start` — единственный подтверждённый
платёжный сценарий.

## Consent

Все события завязаны на счётчик Метрики, который монтируется только при
согласии на аналитику (`categories.analytics`). При отказе `window.ym`
не определён и `track()` — безопасный no-op.
