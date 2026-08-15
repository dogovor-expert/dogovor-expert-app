# TODO (позже): подключить email-отправку через Zoho ZeptoMail

Код уже готов и задеплоен: `src/app/api/export/email/route.ts` поддерживает
два провайдера — ZeptoMail (приоритет) и Resend (запасной). Осталось только
получить ключи и добавить их в Vercel.

## Шаги

### 1. Завести отправителя в ZeptoMail
- https://zeptomail.zoho.eu (или `.com` — выбери регион) → создать аккаунт.
- **Senders → Add Sender** → тип **Domain** → добавить домен отправителя
  (например, `dogovor.expert` после перехода на новый домен).
- ZeptoMail выдаст DNS-записи (SPF, DKIM, DMARC, bounce CNAME) — добавить их
  у регистратора домена (reg.ru) и дождаться верификации.

### 2. Создать токен
- **Sending Tokens → New Token** → название `dogovor` → скопировать токен.

### 3. Добавить переменные в Vercel
Dashboard → Settings → Environment Variables (проект `dogovor-templates`):
- `ZEPTOMAIL_TOKEN` = токен
- `EMAIL_FROM` = `no-reply@dogovor.expert`
- (необязательно) `EMAIL_FROM_NAME` = `Dogovor.fun` → заменить на `Dogovor.expert`

### 4. Проверка
```
curl -X POST https://dogovor.expert/api/export/email -H "Content-Type: application/json" -d "{\"email\":\"твоя@почта.ru\",\"filename\":\"doc\",\"pdfBase64\":\"dGVzdA==\"}"
```
Ожидаемый ответ: `{"data":{"id":"..."}}` и письмо на почту.

Статус сейчас: на проде возвращается `{"error":"email_not_configured"}` (501) —
это ожидаемо, пока нет ключа.