# Dogovor.expert — конструктор юридических документов

**Dogovor.expert** — это веб-приложение на Next.js 15 для создания, редактирования и экспорта юридических документов (договоры, расписки, заявления, доверенности и др.) с поддержкой OCR, подписи КЭП, интеграции с облачными хранилищами и платёжными системами.

## 🚀 Основные возможности

- **Конструктор документов** — пошаговое заполнение полей, предпросмотр, экспорт в PDF/Docx.
- **Библиотека шаблонов** — сотни готовых форм (договоры, акты, заявления, жалобы, иски, кадровые документы, налоговые формы, миграционные документы).
- **Калькуляторы** — госпошлины, пени, индексация, налоги (НДФЛ, НДС, УСН), алименты, отпускные, штрафы ГИБДД, транспортный налог, коммунальные пени.
- **OCR и конвертеры** — распознавание текста из изображений/PDF, объединение/разделение PDF, подпись PDF, Docx в печатную форму.
- **Платная подписка** — биллинг, автопродление, история платежей, промокоды.
- **Админ-панель** — управление пользователями, фидбеком, лидами, платежами, аудит.
- **Интеграции** — DaData, Telegram, облачные хранилища (Google Drive, Yandex Disk, Dropbox), Autoteka, OSAGO.

## 🛠️ Технологический стек

- **Фреймворк**: Next.js 15 (App Router, React 19, TypeScript)
- **Стили**: Tailwind CSS 3
- **БД/аутентификация**: Supabase (SSR, RLS, миграции)
- **Платежи/лимиты**: Upstash Redis + Rate Limit
- **Документы**: pdf-lib, docx, mammoth, pdfjs-dist, qrcode, file-saver
- **OCR**: Tesseract.js, PaddleOCR (onnxruntime-web)
- **Подпись**: интеграция с КриптоПРО (CryptoPro), встраивание PAdES
- **Аналитика**: Яндекс.Метрика
- **Тестирование**: Vitest, Playwright, React Testing Library
- **Документация**: Storybook 8
- **CI/CD**: GitHub Actions

## 📦 Установка и запуск

### Требования
- Node.js 24+
- npm, yarn или pnpm
- Учётная запись Supabase (для продакшена)
- Ключи Upstash Redis (для rate limiting)

### Шаги

1. Клонируйте репозиторий:
   ```bash
   git clone <repo-url>
   cd site Dogovor
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Создайте файл `.env.local` в корне проекта и заполните переменные окружения (см. `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   UPSTASH_REDIS_REST_URL=<your-upstash-redis-url>
   UPSTASH_REDIS_REST_TOKEN=<your-upstash-redis-token>
   # ... остальные переменные
   ```

4. Запустите миграции Supabase (локально):
   ```bash
   npx supabase start
   npx supabase db reset
   ```

5. Запустите приложение в режиме разработки:
   ```bash
   npm run dev
   ```

6. Откройте [http://localhost:3000](http://localhost:3000).

### Сборка для продакшена
```bash
npm run build
npm run start
```

## 🧪 Тестирование

### Unit-тесты (Vitest)
```bash
npm run test:unit
```

### Интеграционные тесты (с реальной БД)
```bash
# Запустите локальный Supabase
npx supabase start
# Выполните миграции
npx supabase db reset
# Запустите тесты
npm run test:integration
```

### E2E-тесты (Playwright)
```bash
npx playwright install
npm run test:e2e
```

### Покрытие
```bash
npm run coverage
```

## 📖 Документация компонентов (Storybook)
```bash
npm run storybook
```
Откроется [http://localhost:6006](http://localhost:6006).

## 🔒 Безопасность

- **CSP с nonce** — строгая политика безопасности, защита от XSS.
- **Rate limiting** — через Upstash Redis (fail-open).
- **2FA** — поддержка двухфакторной аутентификации для администраторов и пользователей.
- **DAL (Data Access Layer)** — централизованная авторизация.
- **Zod-валидация** — всех входящих данных в API.
- **CSRF-защита** — проверка Origin/Referer для мутирующих запросов.

## 🌐 Деплой

Проект оптимизирован для деплоя на Vercel. Поддерживаются переменные окружения для продакшена.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/dogovor-expert)

## 📝 Лицензия

Этот проект является частной разработкой. Все права защищены.

---

**Сделано с ❤️ для юристов и не только.**