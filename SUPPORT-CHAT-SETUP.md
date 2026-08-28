# Чат поддержки (Telegram-мост) — настройка

Собственный бесплатный виджет чата вместо платного Jivo. Сообщения посетителей приходят
оператору в Telegram (тема на каждого посетителя), ответы оператора возвращаются на сайт в реальном времени.

## Архитектура

```
Посетитель → POST /api/chat → Upstash Redis (история + map visitor↔topic)
                              → Telegram: createForumTopic / sendMessage (message_thread_id)
Оператор отвечает в теме → Webhook POST /api/telegram/webhook (secret_token)
                              → Redis → поллинг виджета (каждые 2.5 c)
```

- `src/components/support/SupportLauncher.tsx` — единая плавающая кнопка внизу **слева** (вкладки «Чат» / «Проблема»).
- `src/components/support/ChatPanel.tsx` — UI чата (пре-форма, сообщения, поллинг).
- `src/app/api/chat/route.ts` — отправка и получение сообщений.
- `src/app/api/telegram/webhook/route.ts` — приём ответов оператора.
- `src/lib/chat-store.ts` — хранилище в Upstash Redis (TTL 30 дней).
- `src/lib/telegram-chat.ts` — вызовы Telegram Bot API (без SDK).

## Переменные окружения (Vercel Dashboard → Environment Variables)

| Переменная | Назначение |
|---|---|
| `NEXT_PUBLIC_CHAT_ENABLED` | `"1"` — включить чат. `"0"`/пусто — только вкладка «Проблема». |
| `TELEGRAM_BOT_TOKEN` | токен бота от @BotFather (уже используется для уведомлений). |
| `TELEGRAM_SUPPORT_GROUP_ID` | id супергруппы с **Topics**, вида `-1001234567890`. Отдельный от `TELEGRAM_CHAT_ID` (личные уведомления). |
| `TELEGRAM_WEBHOOK_SECRET` | случайная строка ≥16 символов (`openssl rand -hex 16`). Проверяется в заголовке webhook. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | уже есть в проекте (используется rate limiter). |

## One-time настройка

1. @BotFather → `/newbot` (или используйте существующий `TELEGRAM_BOT_TOKEN`).
2. Создайте **супергруппу**, включите **Topics** (General topics) в настройках группы.
3. Добавьте бота в группу **администратором** с правами *Manage Topics* и *Send Messages*.
4. Узнайте `id` группы (через `@RawDataBot` или `getChat`): он вида `-100…`.
5. `TELEGRAM_WEBHOOK_SECRET=$(openssl rand -hex 16)`.
6. После деплоя сайта выполните:
   ```
   node scripts/setup-telegram-webhook.mjs https://dogovor.expert
   ```
   (скрипт прочитает `.env.local` или переменные окружения и вызовет `setWebhook`).
7. В Vercel задайте `NEXT_PUBLIC_CHAT_ENABLED=1` и задеплойте.

## Безопасность

- Webhook валидирует `X-Telegram-Bot-Api-Secret-Token` (constant-time сравнение). Без секрета — 401.
- Игнорируются собственные исходящие сообщения бота (`from.is_bot`) — нет петли.
- Только сообщения из `TELEGRAM_SUPPORT_GROUP_ID` и только в темах (`message_thread_id != 1`).
- Сообщения ограничены 4000 символов, профиль валидируется (email), rate limit 30/мин на IP.
- История в Redis с TTL 30 дней (переписка может содержать ФИО/паспортные данные).

## Проверка локально

Без `UPSTASH_REDIS_*` и Telegram-переменных чат работает в режиме деградации (история не сохраняется,
`/api/chat` вернёт 503). Вкладка «Проблема» всегда работает (существующий пайплайн `/api/feedback` + Supabase).
