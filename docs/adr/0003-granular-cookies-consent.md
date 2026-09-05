# 0003. Granular cookies consent (GDPR Art. 7(2))

## Status

Accepted (2026-09-05)

## Context

После аудита cookies-системы (05.09.2026) выявлены нарушения GDPR Art. 7(2):
- "Reject all" не равноправна "Accept all" (EDPB Guidelines 03/2022)
- Нет категорий cookies (necessary/analytics/marketing)
- Нет механизма отзыва согласия (GDPR Art. 7(3))
- YandexMetrika не подписан на изменение consent (метрика не работала)

## Decision

Внедряем **granular consent** через `useCookieConsent` (singleton через useSyncExternalStore).

### Архитектура
- **Тип**: `{ necessary: true, analytics: boolean, marketing: boolean }`
- **Storage**: `localStorage` с JSON `{ categories, ts, policyVersion }`
- **TTL**: 365 дней (CNIL рекомендация)
- **Broadcast**: CustomEvent `dogovor:cookie-consent` для всех потребителей
- **Multi-tab**: storage event

### UI
- **3 кнопки** равного веса: "Принять всё" / "Только необходимые" / "Настроить"
- **Persistent иконка 🍪** в правом нижнем углу после решения
- **Панель настроек** с чекбоксами по категориям
- **A11y**: Escape, focus-trap, autoFocus, aria-live, prefers-reduced-motion

## Consequences

### Положительные
- GDPR/152-ФЗ compliant
- Юзер контролирует analytics/marketing
- YandexMetrika корректно подписан через broadcast
- Простой отзыв (одна иконка)
- A11y для screen reader пользователей

### Отрицательные
- Сложнее, чем all-or-nothing
- Требует поддержки policy version (re-consent через 12 мес)
- Нужно обновлять `/privacy` при изменении категорий

## Alternatives Considered

### OneTrust / Cookiebot (SaaS)
- ❌ Платный ($20-100/мес)
- ❌ Vendor lock-in
- ❌ Перегружен для нашего размера
- ✅ Готовые TCF v2.2 compliance

### TCF v2.2 (Transparency and Consent Framework)
- ❌ Избыточно (нет programmatic ads у нас)
- ❌ Сложная интеграция
- ❌ Нужен CMP-провайдер

### Всегда отказ (privacy-first)
- ❌ Теряем метрики (аналитика поведения)
- ❌ Не можем улучшать UX на основе данных
- ❌ Юзеры не могут выбрать (тоже плохо для UX)

## References

- GDPR Art. 7: <https://gdpr-info.eu/art-7-gdpr/>
- EDPB Guidelines 05/2020: <https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en>
- CNIL: <https://www.cnil.fr/en/cookies-and-other-trackers>
- Code: `src/hooks/useCookieConsent.ts`
- UI: `src/components/cookie/CookieBanner.tsx`
- Privacy: `src/app/privacy/page.tsx` §6
