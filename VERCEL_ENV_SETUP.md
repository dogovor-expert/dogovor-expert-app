# Vercel Environment Variables — список для переноса из .env.production

> ⚠️ Файл `.env.production` содержит **реальные production-secret'ы** (YooKassa live, Sentry, Supabase service-role, cron-secret, chat-HMAC). Он в `.gitignore`, но лежит на диске. **После импорта в Vercel — удалить локальную копию.**

## Шаги переноса

### 1. Через Vercel Dashboard
- https://vercel.com/dogovor-expert/settings/environments
- Для каждой переменной: добавить в **Production**, **Preview** (опц.), **Development**
- После добавления всех — `vercel env pull .env.local` (подтянет значения)

### 2. Через Vercel CLI
```powershell
# Установить
npm i -g vercel
vercel login

# Линкнуть проект
cd "D:\Мои сайты\site Dogovor"
vercel link

# Добавить каждую переменную (Production)
# Критичные (секреты):
Get-Content .env.production | ForEach-Object {
  if ($_ -match '^(?<k>[A-Z_]+)="(?<v>.*)"$') {
    vercel env add $matches.k production <<< $matches.v
  }
}
```

## Список переменных

| Имя | Тип | Где используется | Чувствительность |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | клиент + сервер | низкая |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | клиент (anon) | низкая |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** | server (admin client) | **высокая** — RLS bypass |
| `NEXT_PUBLIC_APP_URL` | public | CSP/CSRF | низкая |
| `NEXT_PUBLIC_SITE_URL` | public | admin-auth | низкая |
| `SITE_URL` | public | misc | низкая |
| `YOOKASSA_SHOP_ID` | public | checkout | низкая |
| `YOOKASSA_SECRET_KEY` | **secret** | payment API | **высокая** — деньги |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public | captcha | низкая |
| `TURNSTILE_SECRET_KEY` *(если есть)* | **secret** | captcha verify | высокая |
| `SENTRY_DSN` | server | error reporting | средняя |
| `NEXT_PUBLIC_SENTRY_DSN` | public | client Sentry | средняя |
| `SENTRY_ORG` | public | Sentry CI | низкая |
| `SENTRY_PROJECT` | public | Sentry CI | низкая |
| `SENTRY_AUTH_TOKEN` | **secret** | Sentry source maps upload | **высокая** |
| `CRON_SECRET` | **secret** | `/api/cron/*` | **высокая** |
| `CHAT_HMAC_SECRET` | **secret** | chat | высокая |
| `APIPOINT_TOKEN` | **secret** | внешний API | высокая |
| `UPSTASH_REDIS_REST_URL` | server | rate limit | низкая |
| `UPSTASH_REDIS_REST_TOKEN` | **secret** | rate limit | **высокая** |
| `ZEPTOMAIL_TOKEN` | **secret** | email | **высокая** |
| `RESEND_API_KEY` | **secret** | email fallback | **высокая** |
| `DADATA_API_KEY` | **secret** | suggest/find | высокая |
| `GOOGLE_CLIENT_SECRET` | **secret** | OAuth Google | **высокая** |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | public | OAuth | низкая |
| `YANDEX_CLIENT_SECRET` | **secret** | OAuth Yandex | **высокая** |
| `NEXT_PUBLIC_YANDEX_CLIENT_ID` | public | OAuth | низкая |
| `DROPBOX_CLIENT_SECRET` | **secret** | OAuth Dropbox | **высокая** |
| `NEXT_PUBLIC_DROPBOX_CLIENT_ID` | public | OAuth | низкая |
| `ADMIN_REQUIRE_2FA` | public | middleware | низкая |
| `RATELIMIT_DISABLED` | server | ratelimit.ts | низкая (только dev!) |
| `PROMO_ENDS_AT` | public | pricing | низкая |
| `NEXT_PUBLIC_SITE_VERSION` | public | cache busting | низкая |
| `EMAIL_FROM` | server | email | низкая |
| `EMAIL_FROM_NAME` | server | email | низкая |

## После импорта

```powershell
# 1. Удалить локальный .env.production
Remove-Item .env.production -Force

# 2. Создать .env.local через Vercel CLI
vercel env pull .env.local

# 3. Убедиться, что .gitignore покрывает
# .env, .env*.local, .env.production — уже в .gitignore ✅

# 4. Проверить, что приложение работает
npm run dev
```

## Ротация (если что-то утёкло)

| Сервис | Где ротировать |
|---|---|
| YooKassa | https://yookassa.ru/my/shop/first → API-ключи |
| Supabase | Settings → API → `service_role` (можно `Roll`) |
| Sentry | Settings → Auth Tokens → `Revoke` + создать новый |
| Upstash | Console → REST API → Roll |
| ZeptoMail / Resend | Account → API Keys |
| Dadata | Account → API-ключи |
| Google OAuth | Cloud Console → Credentials → recreate |
| Yandex OAuth | OAuth-center → revoke + create |
| Dropbox OAuth | App console → regenerate |
| CRON_SECRET | сгенерировать новый: `node -e "console.log(crypto.randomBytes(32).toString('hex'))"` |
| CHAT_HMAC_SECRET | аналогично |

После ротации — обновить переменные в Vercel (и в `.env.local` если используется локально).
