# Тестирование УКЭП-контура

Команды для проверки ГОСТ-подписи и проверки отзыва сертификатов (OCSP/CRL) без реального КриптоПро Browser Plugin.

## Локальные тесты (без сети)

```bash
npm run test:ukep
```

Запускает два файла:

- `src/lib/__tests__/ukep-e2e-pipeline.test.ts` — 5 сквозных тестов: подпись PDF через `signPdfWithCryptoPro` на виртуальном `window.cadesplugin` (эмулятор в `src/lib/__tests__/mocks/virtual-cadesplugin.ts`, настоящая ГОСТ-подпись через node-gost-crypto) с проверкой `verifyPAdESCrypto`: валидная подпись, отзыв по OCSP, отзыв по CRL, недоступность службы отзыва (offline → warning, документ валиден), наличие TSA-штампа времени (`1.2.840.113549.1.9.16.2.14` в unsignedAttrs).
- `src/lib/__tests__/ocsp-crl.test.ts` — 10 модульных тестов `checkOcsp`/`checkCrl` с подменой HTTP через `fetchImpl`: good/revoked, таймаут и сетевые ошибки, кэширование (повторный вызов не шлёт запрос).

## Live-проверка тестового контура КриптоПро

```bash
npm run test:ukep:live
```

Выполняет реальные HTTP-запросы к `testca2012.cryptopro.ru`:

- TSP — POST `/tsp/tsp.srf`
- OCSP — POST `/ocsp/ocsp.srf`
- CRL — GET `/ui/CaCerts.aspx`

Выводит таблицу статусов. Недоступность внешних сервисов — не ошибка теста: скрипт лишь проверяет доступность.

## Связанные сущности

- `src/lib/ocsp.ts` — `checkOcsp(cert, url, {fetchImpl?})`
- `src/lib/crl.ts` — `checkCrl(cert, url, {fetchImpl?})`
- `src/lib/signCryptoPro.ts` — `signPdfWithCryptoPro`, `validateCertificate`
- `src/lib/pades-verify.ts` — `verifyPAdESCrypto`
- `src/lib/tsa.ts` — TSA-пресеты (`testca2012.cryptopro.ru/tsp/tsp.srf` и др.)