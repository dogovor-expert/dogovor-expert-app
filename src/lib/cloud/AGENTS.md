# AGENTS.md — src/lib/cloud

## Правила облачных провайдеров (overrides root)

### Поддерживаемые провайдеры
- Google Drive (oauth)
- Яндекс.Диск (oauth, yandex-rest)
- Dropbox (oauth)
- Cloud.ru (S3-совместимый)

### Конвенции
- Каждый провайдер в своей папке: `google/`, `yandex/`, `dropbox/`
- Общий интерфейс `CloudProvider` в `types.ts`
- `index.ts` реэкспортирует ТОЛЬКО публичный API

### OAuth flow
- `state` параметр ОБЯЗАТЕЛЬНО (CSRF protection)
- `redirect_uri` — абсолютный URL из env, **НЕ** относительный
- Scope минимальный: `drive.file` (не `drive.full`)
- Токены хранить encrypted в Supabase (RLS защищает)

### Безопасность
- **НЕ** сохранять `refresh_token` в localStorage (только в Supabase, server-side)
- `client_secret` — только server-side, **никогда** в client
- Rate limit для OAuth endpoints (5 req/min per IP)
- Логировать все OAuth попытки в `audit_log`

### API limits
- Google Drive: 12,000 req/min per project, 1,000 req/100sec per user
- Яндекс.Диск: 5,000 req/day per OAuth token
- Dropbox: ~100 req/min per app

### Запрещено
- Прямой запрос к cloud API из client (только через наш API route)
- Скачивание всего диска пользователя (только нужные файлы)
- Хранение `access_token` дольше чем нужно (1 час по OAuth spec)
