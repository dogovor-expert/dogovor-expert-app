# План: User-side CryptoPro (подпись пользователем на своём ключе)

> Восстановлено из сессии 2026-09-02 (частичная потеря кириллицы в бэкапе устранена).
> Статус: план утверждён пользователем, реализация НЕ начата. Оценка: 5–7 дней.

## Главный принцип

**Сайт НЕ ставит подпись. Сайт только готовит документ, а пользователь подписывает СВОИМ ключом в СВОЁМ CryptoPro, результат возвращается на сайт.**

- Юридически значимую подпись создаёт **сам пользователь** через свой СКЗИ (CryptoPro CSP + сертификат от аккредитованного УЦ)
- Сайт — просто «помощник» по форматированию PDF, не оператор ЭП, не УЦ
- Все риски (валидность подписи, отзыв сертификата, TSA) лежат на **пользователе и его УЦ**
- Сайт защищён **disclaimer + логированием + честной архитектурой**

## Сценарий пользователя

1. Юзер нажимает «Подписать документ» на dogovor.expert
2. Сайт показывает диалог: «Это действие подпишет документ вашей КЭП. Убедитесь, что у вас установлен КриптоПро CSP 5.0+ и есть действующий квалифицированный сертификат.»
3. Юзер нажимает «Продолжить»
4. Сайт проверяет, установлен ли CryptoPro Browser Plugin (`window.cadesplugin`); если нет — ссылка на cryptopro.ru/products/cades-plugin
5. Сайт показывает UI выбора сертификата (через плагин)
6. Юзер выбирает сертификат, подтверждает
7. Сайт отдаёт PDF + свои данные для подписи (хэш документа, реквизиты сторон)
8. CryptoPro-плагин считает подпись (используя закрытый ключ пользователя) — **ключ не покидает компьютер**
9. Сайт получает detached signature (CMS/PKCS#7)
10. Сайт встраивает подпись в PDF
11. Сайт сохраняет PDF + лог
12. Юзер получает подписанный PDF + лог действий

## Слой 1: UI (frontend)

**1.1 Проверка плагина** `src/components/sign/CheckPlugin.tsx`:
- `useState<"checking" | "ok" | "missing">`, проверка `(window as any).cadesplugin` в useEffect
- При missing: `role="alert"` + ссылка на скачивание плагина + «после установки обновите страницу»

**1.2 Выбор сертификата** (через `cadesplugin`), функция `listCertificates(): Promise<CertInfo[]>`:
```ts
const store = await cades.CreateObjectAsync("CAdESCOM.Store");
await store.Open(cades.CAPICOM_CURRENT_USER_STORE, cades.CAPICOM_MY_STORE, cades.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);
// перебор certificates: HasPrivateKey → push { thumbprint, subjectName, validTo, hasPrivateKey }
```

**1.3 Подписание** `signWithUserCertificate(pdfBytes, thumbprint, tsaUrl?)`:
- Поиск сертификата: `certs.Find(cades.CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint)`
- `CAdESCOM.CPSigner`: `propset_Certificate`, `propset_TSAAddress(tsaUrl || "")` (пустая строка = без TSA), `propset_Options(CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN)`
- `CAdESCOM.CadesSignedData`: `propset_ContentEncoding(CADESCOM_BASE64_TO_BINARY)`, `propset_Content(btoa(...))`
- `SignCades(signer, CADESCOM_CADES_BES)`; при ошибке X-Long → fallback BES + отдельный флаг для UI
- Возвращает `{ signatureDer: Uint8Array, certInfo }` (detached — PDF остаётся как есть)

**1.4 Встраивание подписи в PDF** (pdf-lib на клиенте) `embedSignatureIntoPdf()`:
- `/Sig` dictionary: `Filter: "CryptoPro PDF"`, `SubFilter: "adbe.pkcs7.detached"`, `Contents` (DER), `M`, `Name`, `Reason: "Подписание документа на dogovor.expert"`
- AcroForm: `SigFlags: 3` (SignaturesExist + AppendOnly)

## Слой 2: API (server)

**2.1 `/api/sign/prepare`** (генерация PDF для подписания):
- `withCsrf` + `isSameOrigin` + auth + `limiters.signPrepare` по user.id
- Загружаем документ (проверка `user_id`), рендерим PDF **на сервере** (гарантия одинакового документа у всех сторон)
- Считаем SHA-256, логируем в `sign_audit` (action=prepare, hash, ip, user_agent)
- Отдаём `{ pdfBase64, documentHash, documentId }` — **не сохраняем PDF в БД** (он ещё не подписан)

**2.2 `/api/sign/accept`** (приём подписанного PDF):
- `withCsrf` + `isSameOrigin` + auth + `limiters.signAccept`
- Валидация: `signedPdfBase64` ≤ 50 МБ
- Пересчитываем SHA-256, загружаем в Storage (`signed/${user.id}/${documentId}-${Date.now()}.pdf`, приватный бакет)
- INSERT в `document_signatures`: thumbprint, subject, valid_to, algorithm ('CAdES-BES'|'CAdES-X-Long-Type-1'), signature_path, hash, ip, user_agent
- Возвращаем `{ signatureId, downloadUrl: /api/sign/[id]/download }` — только signed URL с TTL

## Слой 3: БД (Supabase) — миграция `20260902_signatures.sql`

```sql
create table if not exists public.sign_audit (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  action text not null check (action in ('prepare','accept','download','verify')),
  document_hash_sha256 text,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
alter table public.sign_audit enable row level security;
create policy sign_audit_select_own on public.sign_audit
  for select using (auth.uid() = user_id or public.is_admin());

create table if not exists public.document_signatures (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  certificate_thumbprint text not null,
  certificate_subject text not null,
  certificate_valid_to timestamptz not null,
  signature_algorithm text not null,  -- 'CAdES-BES' / 'CAdES-X-Long-Type-1'
  signature_path text not null,
  document_hash_sha256 text not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
alter table public.document_signatures enable row level security;
create policy document_signatures_select_own on public.document_signatures
  for select using (auth.uid() = user_id or public.is_admin());
create policy document_signatures_insert_own on public.document_signatures
  for insert with check (auth.uid() = user_id);
create index document_signatures_doc_idx on public.document_signatures (document_id, created_at desc);

insert into storage.buckets (id, name, public)
values ('signed-documents', 'signed-documents', false)
on conflict (id) do nothing;
```

## Слой 4: Disclaimer перед подписанием (SignDialog.tsx)

Амбер-блок со списком:
- Подписание производится **вашей электронной подписью** через установленный КриптоПро CSP 5.0+
- Сайт **не хранит ваш закрытый ключ** и не имеет к нему доступа
- Юридическая значимость определяется **вашим сертификатом и удостоверяющим центром**
- Убедитесь, что сертификат **действующий** и выдан **аккредитованным УЦ**
- Для долговременного хранения (>1 года) рекомендуются сервисы с активной меткой времени (Контур.Диадок и др.)
- Обязательный чекбокс: «Я понимаю, что подпись создаётся моим ключом, и сайт не несёт ответственности за действия удостоверяющего центра»

## Слой 5: Юридические артефакты

**5.1 ToS, новый раздел «8. Электронная подпись»:**
- 8.1 Сервис предоставляет техническую возможность подписать документ ЭП пользователя через установленные на его устройстве средства криптографической защиты (CryptoPro CSP)
- 8.2 Сервис **не является** УЦ, оператором ЭДО или участником отношений в сфере ЭП по 63-ФЗ
- 8.3 Закрытый ключ хранится исключительно на устройстве пользователя и не передаётся на серверы сервиса
- 8.4 Сервис не осуществляет: выдачу сертификатов; проверку действительности в реальном времени (отзыв, срок, аккредитация); постановку штампа времени; долговременное хранение с доказательной базой
- 8.5 Пользователь самостоятельно несёт ответственность за: сохранность закрытого ключа; выбор аккредитованного УЦ; проверку сертификата до подписания; долговременное хранение подписанного документа
- 8.6 Сервис хранит подписанный PDF исключительно как техническую копию по запросу; срок хранения [согласовать], по истечении — удаление

**5.2 Privacy Policy:**
- Храним: сертификат (только публичная часть — subject, thumbprint, срок), SHA-256 хэш подписанного документа, IP, дата/время подписания
- НЕ храним: закрытый ключ, пароль контейнера, пин-код, содержимое после удаления
- Цель: возможность повторной проверки подписи пользователем
- Срок: [согласовать, по умолчанию 3 года]; удаление по запросу через ЛК

**5.3 Лицензионное соглашение с УЦ:** пользователь сам приобретает сертификат (КриптоПро УЦ, Контур, Тензор, Аналитика и др.). Сайт не продаёт сертификаты — только партнёрские ссылки.

## Слой 6: Технические защиты от исков

1. **Полное логирование**: `sign_audit.document_hash_sha256` доказывает, какой именно хэш был у документа в момент подписания; thumbprint+IP+user_agent+created_at — кто, откуда, когда
2. **Проверка хэша при скачивании** (defensive): при выдаче подписанного PDF пересчитываем хэш и сверяем с БД; не совпал → отказ в выдаче (документ изменён после подписания)
3. **Ограничение ответственности в ToS**: максимум = стоимость PRO-подписки за 1 месяц; споры по подписи — между пользователем и его УЦ
4. **Отказ от «квалифицированности»** в UI: используем нейтральный термин «электронная подпись» (63-ФЗ), без слов «квалифицированная», «юридически значимая»; юзер сам решает, достаточно ли его сертификата

## Сравнение рисков: текущая (фейк-TSA) vs user-side

| Риск | Сейчас (фейк-TSA) | Новая (user-side) |
|---|---|---|
| Подпись невалидна через год | Высокий | Низкий (проблема юзера, не сайта) |
| Суд отклонит подпись | Высокий | Низкий (с правильной КЭП — примет) |
| Иск от пользователя за обман | Высокий | Низкий (disclaimer + честный UI) |
| Претензия ФСБ за «фейк TSA» | Высокий | Нулевой (нет таких заявлений) |
| Проверка Роскомнадзора (152-ФЗ) | Средний | Низкий (не храним контент, только хэши) |
| Затраты на разработку | — | 5–7 дней |
| Зависимость от плагина | Полная | Полная (та же) |

## План реализации (5–7 дней)

| День | Что |
|---|---|
| 1 | Миграция `sign_audit` + `document_signatures` + Storage bucket. UI `CheckPlugin.tsx` + `CertificateList.tsx` (выбор сертификата) |
| 2 | API `/api/sign/prepare` (рендер PDF + хэш). UI `SignDialog.tsx` с disclaimer + чекбокс согласия |
| 3 | Клиентский код подписания через `cadesplugin` (отсоединённая подпись CAdES-BES) |
| 4 | API `/api/sign/accept` (приём подписи, загрузка в Storage, логирование). UI загрузки/сохранения |
| 5 | Встраивание подписи в PDF (pdf-lib). Скачивание. Тест на разных браузерах |
| 6 | Обновить ToS + Privacy Policy. Добавить `/api/sign/[id]/verify` для повторной проверки |
| 7 | E2E-тесты: подписание, верификация, отказ при несовпадении хэша. Документация для пользователей |

## Чего НЕ делаем (чтобы не вернуться к проблемам)

- ❌ НЕ храним закрытые ключи (даже зашифрованные) — это превращает нас в оператора
- ❌ НЕ заявляем «квалифицированная подпись» — пусть это говорит УЦ пользователя
- ❌ НЕ делаем TSA на своей стороне — если юзер хочет TSA, пусть использует Контур.Диадок
- ❌ НЕ проверяем отзыв за юзера — это работа УЦ
- ❌ НЕ продаём сертификаты от своего имени — только партнёрские ссылки

## Итог

- Снимает все юридические риски с сайта (не оператор ЭП, не УЦ, не посредник — просто удобный PDF-конвертер с кнопкой «подписать»)
- Сохраняет ценность для пользователя (подписать прямо на сайте, не уходя в Контур)
- Совместима с любым сертификатом от любого аккредитованного УЦ
- Дешевле: 5–7 дней (vs 3–5 дней TSA + недели сертификации + 5–15 т.₽/мес TSA-инфраструктура)
- Монетизационный потенциал — партнёрские ссылки на УЦ
