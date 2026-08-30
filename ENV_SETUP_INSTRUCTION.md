# Инструкция: настройка env-переменных (Vercel) — dogovor.expert

**Статус:** рабочая инструкция. Переменные проверены через Vercel API 31.08.2026.
**Проект:** `dogovor.expert` (`prj_cABOmf2bYKyHIff0lHOAJFxzG943`).

---

## Как добавить переменную
Vercel → проект → **Settings → Environment Variables → Add**:
- **Key** = имя (см. ниже)
- **Value** = значение
- **Environments** = выбрать **Production** (и Preview/Development, если нужно локально/на превью)
- Save → проект пересоберётся с новыми переменными.

⚠️ **Безопасность:** значения секретов вводи только в Vercel Dashboard, не клади в `.env.production`/`.env.local` на диск и не вставляй в чат. `NEXT_PUBLIC_*` — публичные (попадут в браузер), туда клади только Client ID.

---

## 1. GOOGLE_CLIENT_SECRET (облачная интеграция Google / Google Drive)
**Проблема:** `src/app/api/cloud/refresh-token/route.ts:24-28` читает ДВЕ переменные — `NEXT_PUBLIC_GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`. Обе сейчас **отсутствуют** → роут возвращает `500 "Google OAuth not configured"`. Интеграция не работает.

**Либо включить (если фича нужна):**
1. Google Cloud Console → APIs & Services → Credentials → создать **OAuth 2.0 Client ID** (Web application) для `dogovor.expert`.
2. Authorized redirect URI = точное значение `redirectUri` из кода: см. `src/lib/cloud/manager.ts` + `src/lib/cloud/providers/google.ts` (обычно `https://dogovor.expert/api/cloud/callback`).
3. Включить Google Drive API + offline-доступ (scopes из `OFFLINE_SCOPES` в `providers/google.ts`).
4. Client ID → `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (Production, +Preview/Development для тестов).
5. Client Secret → `GOOGLE_CLIENT_SECRET` (Production, Secret).
6. Redeploy.

**Либо отключить мёртвую ветку (рекомендую, если Google-Drive не используется):** скрыть опцию Google в UI облачных интеграций и сделать роут fail-closed без 500.

---

## 2. ТРАНЗАКЦИОННАЯ ПОЧТА (ZEPTOMAIL / RESEND / Zoho SMTP)
**Проблема:** `src/lib/mail.ts` шлёт почту, только если задан `ZEPTOMAIL_TOKEN` ИЛИ `RESEND_API_KEY`. **Оба отсутствуют** → `sendEmail()` тихо возвращает `false` → письма (уведомления по фидбеку, отправка экспорта) не уходят. Жив только Telegram-канал.

**Выбран Путь Б — Zoho Mail SMTP (код уже изменён в `src/lib/mail.ts`).**
Теперь `sendEmail()` умеет отправлять через твой существующий ящик Zoho Mail по SMTP — **без новых зависимостей** (через встроенный `node:tls`). Нужно задать переменные:

| Key | Value | Environment |
|---|---|---|
| `ZOHO_SMTP_USER` | твой ящик, напр. `no-reply@dogovor.expert` | Production |
| `ZOHO_SMTP_PASS` | **app-password** (Сервисный пароль Zoho, НЕ пароль от аккаунта!) | Production (Secret) |
| `ZOHO_SMTP_HOST` | `smtp.zoho.com` (для EU — `smtp.zoho.eu`) | Production |
| `ZOHO_SMTP_PORT` | `465` (implicit TLS) | Production |
| `EMAIL_FROM` | от кого, по умолчанию = `ZOHO_SMTP_USER` (можно переопределить) | Production |
| `EMAIL_FROM_NAME` | отображаемое имя, по умолчанию `Dogovor.expert` | Production |

**Важно про пароль:** Zoho Mail требует **app-specific password** (Zoho Mail → Security → App Passwords / Сервисные пароли). Обычный пароль от аккаунта при SMTP-входе не сработает (особенно при 2FA).

**Альтернативы (если не Zoho SMTP):** задать `ZEPTOMAIL_TOKEN` ( Zeptomail API, Product zoho) ИЛИ `RESEND_API_KEY` (Resend) — `mail.ts` их поддерживает как приоритетные источники.

**Порядок провайдеров в `mail.ts`:** Zeptomail → Resend → Zoho SMTP. Если задашь и Zoho, и Zeptomail — уйдёт через Zeptomail.

---

## 3. Что УЖЕ настроено (проверено, трогать не надо)
`CRON_SECRET`, `DADATA_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_SUPPORT_GROUP_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_CHAT_ENABLED`, `TURNSTILE_*`, `APIPOINT_TOKEN`, `TRONK_API_KEY` — **присутствуют**.

Крон автопродления зарегистрирован в Vercel (`0 3 * * *` → `/api/cron/auto-renew`) и `CRON_SECRET` есть → кроны НЕ упадут по 401.
