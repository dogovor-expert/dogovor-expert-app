# Changelog

Все заметные изменения в проекте документируются здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
этот проект придерживается [Semantic Versioning](https://semver.org/lang/ru/).

> **Автогенерация:** release-please автоматически создаёт PR с обновлением
> `package.json` версии + этого файла. См. `.github/workflows/release-please.yml`.

## [1.1.0](https://github.com/dogovor-expert/dogovor-expert-app/compare/v1.0.0...v1.1.0) (2026-09-22)


### Features

* **agents:** AGENTS.md standard + IDE wrappers + quality gate tooling ([545c286](https://github.com/dogovor-expert/dogovor-expert-app/commit/545c28659442678e93edde2387bc0d92c0b61e54))
* **analytics:** add PostHog product analytics gated by cookie consent ([483a53b](https://github.com/dogovor-expert/dogovor-expert-app/commit/483a53b5eed1a2cc4526b6079dfcd34dbeab9f35))
* **analytics:** first-party user_events journal + admin dashboard ([5246c1f](https://github.com/dogovor-expert/dogovor-expert-app/commit/5246c1f8c05680f194edcb76cf0deb88cdee2383))
* **analytics:** session replay (rrweb) + server-side payment events ([ab21c5e](https://github.com/dogovor-expert/dogovor-expert-app/commit/ab21c5e61fe35d833e3b694b4d5c1302a4d8ba59))
* **api:** epts instant yookassa payment - order & pay ([0b8b446](https://github.com/dogovor-expert/dogovor-expert-app/commit/0b8b446dcf491259171e68197ca0c7090261ad72))
* **api:** заявки ЭПТС в админке и вложения в чате ([9a37257](https://github.com/dogovor-expert/dogovor-expert-app/commit/9a3725756bd14b8219329c1e7f7e71e148e01b43))
* **api:** проверка статуса самозанятого (НПД) по API ФНС ([e78c81a](https://github.com/dogovor-expert/dogovor-expert-app/commit/e78c81a253e9e3a77515813289f7fc337227e741))
* **audit:** подтверждение УКЭП, fullscreen-просмотр, sync, ставки ТН, льгота семей 217.1 ([02e992d](https://github.com/dogovor-expert/dogovor-expert-app/commit/02e992df8560cd0aa08eb82be28521db4aa4a24c))
* **auth:** remember-device cookie for 2FA and multi-factor security page ([a347795](https://github.com/dogovor-expert/dogovor-expert-app/commit/a347795cb4301c38a840935478a3e4d839485508))
* **auth:** Yandex SmartCaptcha вместо Cloudflare Turnstile (блок РКН) ([18a3823](https://github.com/dogovor-expert/dogovor-expert-app/commit/18a38232fe573105f1748c4e005ab024078cfe4e))
* **billing:** lazy auto-renewal on user visit (works without Vercel Cron) ([f2de668](https://github.com/dogovor-expert/dogovor-expert-app/commit/f2de66810516761ed5bba91eccf1fa4d654d644e))
* blog +20 SEO articles (auto, finance, law, business, rental) ([8989b2d](https://github.com/dogovor-expert/dogovor-expert-app/commit/8989b2d59669e6a870a585c7418ceccf8b65dcae))
* blog cross-links between all 35 articles ([a462699](https://github.com/dogovor-expert/dogovor-expert-app/commit/a4626999018b7020ba224a96bbd6ce7bf6e74d85))
* blog pagination (10 per page) with SSG, category filter via URL ([0964e72](https://github.com/dogovor-expert/dogovor-expert-app/commit/0964e72d47ade673f35d94ac6d329a26881327f2))
* **cloud:** folder picker for Yandex/Google/Dropbox, createFolder, retry logic ([59f3373](https://github.com/dogovor-expert/dogovor-expert-app/commit/59f3373c950ccebc402d43f58bfbd6e0c8b415a7))
* **cloud:** token refresh (Dropbox), retry logic, server→vault migration, HardDrive icon ([efb99fe](https://github.com/dogovor-expert/dogovor-expert-app/commit/efb99fe7c79cf8815c477152c2452204b1efda55))
* **cloud:** zero-knowledge vault + Yandex/Google/Dropbox OAuth + Connections UI + export to cloud ([6762cee](https://github.com/dogovor-expert/dogovor-expert-app/commit/6762cee9d6273301b5ca2197b2440b775c57ef87))
* **config:** add audit:full orchestrator + reports protocol ([b4eabad](https://github.com/dogovor-expert/dogovor-expert-app/commit/b4eabad7dafb19357b50b364139c4ad78aea39b3))
* **config:** add site audit toolkit (PSI, Lighthouse CI, squirrelscan) ([fda00be](https://github.com/dogovor-expert/dogovor-expert-app/commit/fda00becf0ba68021a285b398c83350ff80db794))
* **connections:** step-by-step provider setup guides with console links, copyable redirect URI, friendly OAuth error mapping ([cc1cdaa](https://github.com/dogovor-expert/dogovor-expert-app/commit/cc1cdaa57beebae27968db681681fe276caae6e6))
* **cookies:** granular consent + persistent settings (GDPR Фаза 1) ([34e78cf](https://github.com/dogovor-expert/dogovor-expert-app/commit/34e78cf02635775395d681df6921e25037684dfa))
* CryptoPro/PAdES user-side signing + lint/type fixes ([7b92ac1](https://github.com/dogovor-expert/dogovor-expert-app/commit/7b92ac1a44b9f5435ba1bd01c02841ff4746c12a))
* deploy all fixes ([8f97a37](https://github.com/dogovor-expert/dogovor-expert-app/commit/8f97a370a07c9f009752ce7716dccce50d983b4c))
* Dockerfile + env-driven CSP/remotePatterns для self-hosted Supabase ([04e7c13](https://github.com/dogovor-expert/dogovor-expert-app/commit/04e7c135c11de15adae3cc5a69b58b4d635fbce5))
* **docs:** add 24 SEO blog articles with cross-links and legal details ([b44bae1](https://github.com/dogovor-expert/dogovor-expert-app/commit/b44bae181af97053e8383a731ed0551724744cd3))
* **documents:** portal-based cloud export popover with brand icons (fixes menu closing before click, overflow clipping) ([1efa4a5](https://github.com/dogovor-expert/dogovor-expert-app/commit/1efa4a56579db3ab6a25e224141abe5b990d8f98))
* PAdES-верификация ГОСТ-подписей + доверенные корни из TSL ([73defa6](https://github.com/dogovor-expert/dogovor-expert-app/commit/73defa61b16f981d593e642c9291765c0d033266))
* **pdf:** конвертер инструменты и FAB-кнопка поддержки ([363bedd](https://github.com/dogovor-expert/dogovor-expert-app/commit/363bedd7e8986f780696eb8b32f4726097942b2c))
* **perf:** ISR with revalidate=3600 on public catalog pages ([434c03f](https://github.com/dogovor-expert/dogovor-expert-app/commit/434c03f1017e405b875eb05ffe5993a1e3a2e815))
* **preview:** react-to-print + client-side PDF download ([c99e818](https://github.com/dogovor-expert/dogovor-expert-app/commit/c99e818dbf2ec333103d28d3f7aaebe44cfd1aca))
* **scanner:** harden OCR pipeline + OCR analytics & 152-FZ consent audit ([cf34746](https://github.com/dogovor-expert/dogovor-expert-app/commit/cf34746e84e3bf7888213871670c9f37185410d6))
* **scanner:** Phase 0-2 + server OCR integration ([490dae4](https://github.com/dogovor-expert/dogovor-expert-app/commit/490dae4723dcc9734fd3259620372cadbe3913b6))
* **scanner:** Phase 5 profiles+planner, rate limit, circuit breaker, lazy Paddle, sharpening ([de6fa5e](https://github.com/dogovor-expert/dogovor-expert-app/commit/de6fa5eedd3c976fba830c9e785d08efa2121edf))
* **scanner:** unified entity/field mapping layer + multi-profile detection + activeRole ([dc0b225](https://github.com/dogovor-expert/dogovor-expert-app/commit/dc0b2254c2d4522b840bee2f7b4616793395b58c))
* **seo:** add canonical and og:url to root layout ([e5e2bd6](https://github.com/dogovor-expert/dogovor-expert-app/commit/e5e2bd6e2f5801cde507ea98005298a756521f3a))
* **share:** zero-knowledge encrypted share link (AES-256-GCM, key in #fragment) ([5829636](https://github.com/dogovor-expert/dogovor-expert-app/commit/582963677907b37bb342e4910c0a86505d3d9331))
* **support:** add Telegram-bridge chat widget, move launcher to bottom-right ([260f06e](https://github.com/dogovor-expert/dogovor-expert-app/commit/260f06eb68e33e51adb83347fa73371c9cc0dfcc))
* **templates:** SEO-страницы 22 калькуляторов /utils/[tool] ([2119c56](https://github.com/dogovor-expert/dogovor-expert-app/commit/2119c561f5464f0bf664b09bb5aa243043c8440d))
* **templates:** конструктор резюме с 10 шаблонами и страница выписки ЭПТС ([aa4465e](https://github.com/dogovor-expert/dogovor-expert-app/commit/aa4465e2beb4b16621eeef1f0a9022daa7405331))
* **templates:** надёжный MRZ загранпаспортов в сканере ([a0c2e38](https://github.com/dogovor-expert/dogovor-expert-app/commit/a0c2e3815c43716cc578c90e417e32d1b5132195))
* **templates:** слоты РСЯ и programmatic-вариации шаблонов ([ba337b8](https://github.com/dogovor-expert/dogovor-expert-app/commit/ba337b8d40fe54abdb5a7f291b2e24d25368044b))
* **ui:** add step-by-step cloud connection guide with error hints ([d09f2d2](https://github.com/dogovor-expert/dogovor-expert-app/commit/d09f2d2d9435a541a09502e26e1580afef32e01f))
* **ui:** blog redesign - listing, article pages, live CTA, ad slots ([83edb2d](https://github.com/dogovor-expert/dogovor-expert-app/commit/83edb2d2fbb47329beb64e4cebfced2dce7a7ee8))
* **ui:** hero-документ и блоки удержания на главной ([8c72d50](https://github.com/dogovor-expert/dogovor-expert-app/commit/8c72d502f7e85f3a0fe3eee6112166287e8a4831))
* **ui:** R1-R6 адаптивность + мобильная таб-панель ([4dfd875](https://github.com/dogovor-expert/dogovor-expert-app/commit/4dfd8758dd40a6985719a1c33345eb782c9f5e93))
* **ui:** redesign /blanks - brand palette, sort, category tiles, FAQ, CTA ([0378afb](https://github.com/dogovor-expert/dogovor-expert-app/commit/0378afb08b455bec64a4e21a5372951ade8f28e2))
* **ui:** redesign calculators page, rename menu, side support launcher ([52c925f](https://github.com/dogovor-expert/dogovor-expert-app/commit/52c925f0d8b290df8306ab2f1e93678976229e83))
* **ui:** replace Inzuro widget with Inssmart ([19070b4](https://github.com/dogovor-expert/dogovor-expert-app/commit/19070b44bcb67037c260f86865ce514e9e7e153c))
* **ui:** SEO-роуты конвертера, брендинг PDF и K-фактор approval ([b714dca](https://github.com/dogovor-expert/dogovor-expert-app/commit/b714dcafb6b8e60e29c6e1170111789870c6e32c))
* **ui:** автоподбор суда (DaData), итоги акта сверки, скрыт пункт «Проверка авто» ([dae3f8f](https://github.com/dogovor-expert/dogovor-expert-app/commit/dae3f8f48b20d8ff889c6a31fd0f912243954a03))
* **ui:** анимации hero, фикс PDF-образца и страницы облачных дисков ([e88093c](https://github.com/dogovor-expert/dogovor-expert-app/commit/e88093c3a883ae29c66b87255a60ad949b446e41))
* **ui:** редизайн главной, виджеты погоды/курсов, тёмное меню, единый EmptyState ([e841f73](https://github.com/dogovor-expert/dogovor-expert-app/commit/e841f73ee563623513e370fee03d5e0fba5345e3))
* **ui:** сравнение редакций договора и протокол разногласий ([cd4ba24](https://github.com/dogovor-expert/dogovor-expert-app/commit/cd4ba241cb028724578689d064359313c6f8293d))
* **ui:** экспорт резюме в DOC, надёжная печать PDF, фикс масштаба превью на мобильных ([13395b0](https://github.com/dogovor-expert/dogovor-expert-app/commit/13395b09a0c87a9d83762021d0cf3860fdd042d3))
* **vault:** passphrase UI, auto-lock, backup/restore, cloud import/export, settings integration ([943c821](https://github.com/dogovor-expert/dogovor-expert-app/commit/943c821cc6dd4ff35432f61d310be91c7dbb8370))
* vin/plate validation, web worker pdf, seo /utils, trademark page (P1+P2) ([e89c2da](https://github.com/dogovor-expert/dogovor-expert-app/commit/e89c2da780a971e0a01bcc73ff823f25cea1e288))
* аналитика воронки, result-first пейволл, честный watermark free ([359f255](https://github.com/dogovor-expert/dogovor-expert-app/commit/359f2552ad360c0dd97f79cfe03e43c1ca72812b))
* аналитика по дням, удаление записей визитов и PDF-экспорт резюме ([1b14c41](https://github.com/dogovor-expert/dogovor-expert-app/commit/1b14c413c787211ec22b2e85c85a6800fe426a6b))
* аудит удалений, кэш аналитики и вложения в инбоксе чата ([7fb1a7f](https://github.com/dogovor-expert/dogovor-expert-app/commit/7fb1a7ff420472e41ffff948f3ebde3f4808b77d))
* закрытие аудита 2026-09 (сессия 2) — калькуляторы, RBAC, админка, SEO ([80e6698](https://github.com/dogovor-expert/dogovor-expert-app/commit/80e669887369029e06ca3b1439f2d43637bd4827))
* уведомления, подарочные продления, согласия на рассылку, чат-инбокс ([15330d4](https://github.com/dogovor-expert/dogovor-expert-app/commit/15330d4811526847e367ffb68d4673aa28e9d4cf))


### Bug Fixes

* add wss:// for Yandex Metrica in CSP connect-src ([b7fbecb](https://github.com/dogovor-expert/dogovor-expert-app/commit/b7fbecbe5c4baae124ea91cdc0b81a7e3010d677))
* **admin:** add profiles.is_admin fallback in middleware (match layout) ([d9bcc64](https://github.com/dogovor-expert/dogovor-expert-app/commit/d9bcc649600da9f527d9a7fc53d8416f397f8c3c))
* **agents:** use plain node for blast radius in pre-commit hook ([e134585](https://github.com/dogovor-expert/dogovor-expert-app/commit/e1345858e71c50f1adebda357530936e5eacd294))
* **api:** zod validation for dadata/chat/import routes (P1) ([edd3a0a](https://github.com/dogovor-expert/dogovor-expert-app/commit/edd3a0a0f74c71d57f4b8b70c9629ae3019109ad))
* **api:** аудит безопасности — OCSP/CRL fail-closed, SSRF-guard, OCR MIME, CSP, deps ([0f82e14](https://github.com/dogovor-expert/dogovor-expert-app/commit/0f82e14dcabeb375a521f2ae8e2fc8118655441d))
* **api:** идемпотентность платежей YooKassa + CSRF/Turnstile на /api/leads (ре-аудит) ([42ab218](https://github.com/dogovor-expert/dogovor-expert-app/commit/42ab218fc50ff0f4ab628666b30fc770e46a4776))
* **api:** починка серверной подписи /api/sign (двухшаговый PAdES) ([8342df5](https://github.com/dogovor-expert/dogovor-expert-app/commit/8342df5892f25a31665b8fee62bb265a496c3efe))
* apply audit round fixes (scanner layout, size checks, templates meta, a11y spec) ([f26a809](https://github.com/dogovor-expert/dogovor-expert-app/commit/f26a809a0140a22919f7e6f9b101fbbb4c3e4a7e))
* audit remediation - penalty per-day rates, error boundaries, build-safe supabase, email modal a11y, HSTS single source ([9f28e70](https://github.com/dogovor-expert/dogovor-expert-app/commit/9f28e703967721d75ab01058e160a3642f1a514d))
* **audit:** apply sprint 1+2 security and SEO fixes ([24dad79](https://github.com/dogovor-expert/dogovor-expert-app/commit/24dad79f6c4fb3b794fddb1785320edcdff00807))
* **audit:** form UX, PDF quality, dadata gate, auth resilience, quick edit ([42e098f](https://github.com/dogovor-expert/dogovor-expert-app/commit/42e098f404d88609b9ca7f6f979219f935541ba5))
* **audit:** phase 1 a11y + CLS quick wins ([ce012ef](https://github.com/dogovor-expert/dogovor-expert-app/commit/ce012ef9924ded07097033148283d5fe2873af68))
* **audit:** re-enable eslint on build, protect /connections, images config, lighthouse CI ([e98ee8d](https://github.com/dogovor-expert/dogovor-expert-app/commit/e98ee8dff6cbfc43e707d9ceec7d397ac8433831))
* **audit:** replace strict-dynamic nonce CSP with source-based policy to unblock JS on SSG pages ([fbcb087](https://github.com/dogovor-expert/dogovor-expert-app/commit/fbcb08763dc0863c838cd77d6cf3454ecfa55d9c))
* **audit:** webhook retry, idempotency buckets, rate limits, leads escaping ([8e139f3](https://github.com/dogovor-expert/dogovor-expert-app/commit/8e139f3f5bc26e6402b9c65c6ba3ba9c684cdc74))
* **audit:** НДС 22%, dependsOn-утечка в рендер, квота черновиков, offline-UX ([59839da](https://github.com/dogovor-expert/dogovor-expert-app/commit/59839da268243f40001b900bbed6cb1c6eaea1f5))
* **audit:** правки из глубокого аудита /builder (R1-R6 + C1-C2) ([b5505a0](https://github.com/dogovor-expert/dogovor-expert-app/commit/b5505a0d37e02f8e617658d78c5d978f881de280))
* **audit:** скролл-лок сайдбара, скидка 12.7 ч.2, поп-шаблоны в sitemap, статусы бланков ([e054eb4](https://github.com/dogovor-expert/dogovor-expert-app/commit/e054eb4527bef4aa25a9e781669f81cb62b9efc2))
* **audit:** тикеты сканера T1-T5 — приватность OCR, MRZ-дата, TSA-верификация, CI ([320f10a](https://github.com/dogovor-expert/dogovor-expert-app/commit/320f10af7452ccaacf01959e6503bb87f9b77b22))
* **auth:** ignore session cookies of other Supabase projects ([4e15a90](https://github.com/dogovor-expert/dogovor-expert-app/commit/4e15a905cd2e31b2e03a8fcea2b88d8eedb78275))
* **auth:** MFA on browser client + Yandex userinfo normalizer ([8cd17f0](https://github.com/dogovor-expert/dogovor-expert-app/commit/8cd17f00eee16b00d376e7d7a4434263670d8a02))
* **auth:** read OAuth error param on /login, add forgot-password link, remove dead code, fix e2e ([2e0bc1b](https://github.com/dogovor-expert/dogovor-expert-app/commit/2e0bc1bd3054c487deaf8ead85297dd091e2f3e2))
* **auth:** server-side MFA challenge for httpOnly sessions (OAuth login) ([1ff7c9c](https://github.com/dogovor-expert/dogovor-expert-app/commit/1ff7c9c0ce7e2046f25be01199a7c3085662d1d7))
* **auth:** stop forcing httpOnly on Supabase cookies (restore client session) ([26c05c8](https://github.com/dogovor-expert/dogovor-expert-app/commit/26c05c855de2efae5c452f23178c4ba79611bfcf))
* **auth:** surface errors and add checking state for MFA factor lookup ([b52e9b8](https://github.com/dogovor-expert/dogovor-expert-app/commit/b52e9b8ca258945d6c79088fcbb1d149c4610028))
* **auth:** wrap trust-device route in withCsrf per security invariant ([1388a80](https://github.com/dogovor-expert/dogovor-expert-app/commit/1388a80104b018cac5daa17f9768b725e3a312a9))
* **auth:** капча не пересоздавалась при вводе + fallback при блокировке + ghost-session из cookie ([fb11df4](https://github.com/dogovor-expert/dogovor-expert-app/commit/fb11df419c494827d5b7220b1948b8aa90bed3e1))
* **auth:** редирект OAuth-callback по host-заголовку вместо request.url ([fa05ea8](https://github.com/dogovor-expert/dogovor-expert-app/commit/fa05ea8e948e1c87ce0d66f08923e4c1eb41767a))
* **billing:** real auto-renewal via Vercel Cron + saved-card recurring charge ([c2f4d70](https://github.com/dogovor-expert/dogovor-expert-app/commit/c2f4d7083332faae84062a95f2e474e5115a0186))
* **blanks:** dedupe variant fields in empty blanks, larger price-in-words space, print button, separated page preview ([bcdab58](https://github.com/dogovor-expert/dogovor-expert-app/commit/bcdab58517a45d2f56374bbe7801c28daaee0d66))
* **blanks:** render inline fillable lines in paragraphs (don't strip blank-field spans); thin gray underlines ([7562145](https://github.com/dogovor-expert/dogovor-expert-app/commit/7562145673f43275c196cfe8dbb72633ac54fc9a))
* **blanks:** render static PDF-identical preview images instead of raw HTML ([b94d1d0](https://github.com/dogovor-expert/dogovor-expert-app/commit/b94d1d0ba8cb631adf611c0fba9c0d367f774cc6))
* **blanks:** thicker/darker underline for fillable fields; regenerate all previews ([c09c016](https://github.com/dogovor-expert/dogovor-expert-app/commit/c09c0162fd235ac9a12da51c7c6ce4b4b0dfbf9b))
* **blanks:** unify blank lines across preview/PDF/Word, add search + categories on /blanks ([34dd547](https://github.com/dogovor-expert/dogovor-expert-app/commit/34dd5475a9605572eedd1b1d80dbb5e5297b9e80))
* **builder:** fix hydration mismatch by moving localStorage reads to useEffect ([7a3ec0f](https://github.com/dogovor-expert/dogovor-expert-app/commit/7a3ec0fc6e57837c77ead0abd1c8a826ef1e2c7b))
* **ci:** buildx v4, buildkit cache mounts, fix encoding ([81cb7c3](https://github.com/dogovor-expert/dogovor-expert-app/commit/81cb7c3d16f369815b5a357587e7ce382113ce74))
* **ci:** pin image digest on CapRover deploy to force swarm recreate ([2b8998c](https://github.com/dogovor-expert/dogovor-expert-app/commit/2b8998c491f3acb679fb3e93097d6fabf07ca33c))
* **ci:** semgrep scan вместо ci --error, SARIF-вывод, non-blocking ([d1e5666](https://github.com/dogovor-expert/dogovor-expert-app/commit/d1e56667946835860c74209f1daaf6f3c062dd62))
* **ci:** trigger workflows on master branch, realistic lighthouse thresholds, reuse uint8ToBase64 in builder ([bbd1990](https://github.com/dogovor-expert/dogovor-expert-app/commit/bbd199048f38b7e45a3dc72c0fb0c88bf2ea917e))
* **ci:** VDS-готовность — non-root standalone Docker, 2FA по умолчанию, фиксы ре-аудита ([7276e4f](https://github.com/dogovor-expert/dogovor-expert-app/commit/7276e4fd130441a8c7a22ad51c5e88ec3b0ee51f))
* **ci:** битый YAML-элемент в .semgrep.yml (RuleParseError) ([4aeb5d6](https://github.com/dogovor-expert/dogovor-expert-app/commit/4aeb5d6204c8ff3e58606cb83978c59a060ebd8c))
* **ci:** запекаем NEXT_PUBLIC_PROMO_ENDS_AT в билд (клиентский бандл) ([6173cac](https://github.com/dogovor-expert/dogovor-expert-app/commit/6173cac438f363b1eaeb7f7ceef7e6081e9c8a60))
* **ci:** синтаксис правил semgrep — валидация 11/11 локально ([6cf79a8](https://github.com/dogovor-expert/dogovor-expert-app/commit/6cf79a8aeff16e97a3ef60bae641e0de694d4436))
* **ci:** убрать COPY .npmrc (файла нет в git — ломало GHCR build) ([99d34d8](https://github.com/dogovor-expert/dogovor-expert-app/commit/99d34d8fb78153ba8551465f532ac45185b39582))
* **config:** allow api.polis.online stylesheets for Inzuro widget ([3e8aa3e](https://github.com/dogovor-expert/dogovor-expert-app/commit/3e8aa3eb29e30d6adb0a333ecea2b48022f58ecd))
* **config:** CSP - разрешить smartcaptcha.yandexcloud.net вместо challenges.cloudflare.com ([829eb79](https://github.com/dogovor-expert/dogovor-expert-app/commit/829eb79008a3fcfa2fde2e0a75ada891f140c6c6))
* **config:** dadata + polis.online в CSP, чинит подсказки адреса OSAGO ([68f3988](https://github.com/dogovor-expert/dogovor-expert-app/commit/68f3988af20747161cf48d7f113754a3c62ab796))
* **config:** ESM-compatible Next/PostCSS/Vitest configs; CryptoPro cert validation + auto-validate on load ([6a5e370](https://github.com/dogovor-expert/dogovor-expert-app/commit/6a5e37007eb053f0b4847708c2a466a20818f6c3))
* **config:** extend CSP hosts for cloud providers and PostHog assets, soften COOP ([680377f](https://github.com/dogovor-expert/dogovor-expert-app/commit/680377fbbd5fc84aca7bb250363c5dd5aeb193bd))
* **config:** point container HEALTHCHECK at /api/health ([a7bb152](https://github.com/dogovor-expert/dogovor-expert-app/commit/a7bb152d0a7bd2494ee79571ee715bee5909b81a))
* **cookies:** убран useState(mounted) - useEffect не отрабатывал в проде ([aa51715](https://github.com/dogovor-expert/dogovor-expert-app/commit/aa517157635c5b427accfcadc7422bf155c10eac))
* **cookies:** централизованный хук + isolated banner (4 бага) ([945713a](https://github.com/dogovor-expert/dogovor-expert-app/commit/945713ac5b9cf08e14b197fe5afbfb43f5d50913))
* CSP add challenges.cloudflare.com to connect-src for Turnstile ([3fdc569](https://github.com/dogovor-expert/dogovor-expert-app/commit/3fdc5691c1d828c43e3824c1929f2a5c20835a82))
* **csp,email,cloud,deps:** allow huggingface CDN, unify mail via lib/mail.ts, hide unconfigured cloud providers, drop @ocr-web/core ([f2470cb](https://github.com/dogovor-expert/dogovor-expert-app/commit/f2470cb813c5035e31d316c7a13ca7865ed85215))
* **csp:** allow 'unsafe-eval' in script-src so tesseract WASM compiles in prod ([ace7aa8](https://github.com/dogovor-expert/dogovor-expert-app/commit/ace7aa8b6b00edcb96455910b1500d7a54bacf53))
* **csp:** allow 'unsafe-inline' in script-src (Next.js prerender hydration) ([eb44cf3](https://github.com/dogovor-expert/dogovor-expert-app/commit/eb44cf33e9181e2d9d4f8b197d21eebc4fbce2e8))
* **csp:** allow blob: in frame-src and mc.yandex.ru for WebSocket/iframe (fixes print CSP errors) ([83e9fda](https://github.com/dogovor-expert/dogovor-expert-app/commit/83e9fda6dec2800730a82f49ca8c53e94ed5686c))
* **csp:** allow wasm-unsafe-eval and huggingface cdn for OCR ([3afa819](https://github.com/dogovor-expert/dogovor-expert-app/commit/3afa819b4bd30dced1dd215f5a03c0853a5f0238))
* **csp:** remove 'strict-dynamic' (overrides 'unsafe-inline' per CSP3) ([2aa5a47](https://github.com/dogovor-expert/dogovor-expert-app/commit/2aa5a475bfb4b1f601da44b53380d39b77d7de12))
* **deps:** .release-please-manifest.json — чинит CI-воркфлоу релизов ([4070d7a](https://github.com/dogovor-expert/dogovor-expert-app/commit/4070d7aac5c031dad2b61b30142baf379307ae37))
* DocScanner 15MB limit + CSP challenges.cloudflare.com + Cron GET ([42f027f](https://github.com/dogovor-expert/dogovor-expert-app/commit/42f027fec48a139c0b4fa654be5995f9d6dd6b38))
* eslint ignore workers, fix middleware crypto and unused var ([47cc44e](https://github.com/dogovor-expert/dogovor-expert-app/commit/47cc44ea79824200d52ff9e05e3afd942ad1367f))
* exclude integration tests from unit test run ([cc67922](https://github.com/dogovor-expert/dogovor-expert-app/commit/cc67922ee9e2811cb0e8df4898a472605e4eefa2))
* **hydration:** avoid Date.now() in CountdownTimer initial render (fixes mismatch on auth-gated pages) ([9340bf4](https://github.com/dogovor-expert/dogovor-expert-app/commit/9340bf4091ff1f615464ce46a3e34cdf4258a2d5))
* ignore ESLint during builds for Vercel deployment ([a19a95d](https://github.com/dogovor-expert/dogovor-expert-app/commit/a19a95dad668ef46b26e162d3de44c7f9d2a4f6e))
* **legal:** ст. 12.10 и ч.2 ст. 12.7 — без скидки согласно ч.1.3 ст.32.2 КоАП ([8e2f750](https://github.com/dogovor-expert/dogovor-expert-app/commit/8e2f750b66ebb42a273b2eef05ce244e6ae28539))
* **lint+ux:** resolve all eslint/tsc errors, mobile adaptivity, add jsdom ([914f980](https://github.com/dogovor-expert/dogovor-expert-app/commit/914f980a38223625db08dbc9a57472ba7a9573ad))
* make all PRO features production-ready ([3986097](https://github.com/dogovor-expert/dogovor-expert-app/commit/39860979e74c26206c2494344a7bdb8af761f8db))
* **mobile:** search overlay + touch targets for mobile a11y ([33a6d75](https://github.com/dogovor-expert/dogovor-expert-app/commit/33a6d756b8493e1b979b097097b2fd03ff196193))
* **ocr:** anchor regex patterns with context markers to prevent false positives ([01156ee](https://github.com/dogovor-expert/dogovor-expert-app/commit/01156ee011861555292f426dcbc0ffd67ef15f7f))
* **perf:** bound in-memory caches to prevent memory growth ([8afa8eb](https://github.com/dogovor-expert/dogovor-expert-app/commit/8afa8eb5d4acde163c674b92d07bf91825c1fe58))
* **preview:** replace DocPreview with PdfPreview for identical-to-PDF preview and reliable cross-browser printing (fixes empty preview on other devices, empty print output) ([2d55de5](https://github.com/dogovor-expert/dogovor-expert-app/commit/2d55de530abdd873814c9b83fec32db73b0f1ef3))
* **preview:** replace DocPreview with PdfPreview for identical-to-PDF preview and reliable printing ([8f44047](https://github.com/dogovor-expert/dogovor-expert-app/commit/8f44047ce0a2348e467beee1c8c373f33ca3806d))
* **preview:** window.print() + lz-string share links for cross-device ([03f2bef](https://github.com/dogovor-expert/dogovor-expert-app/commit/03f2befe0e48936a2b2254c6175a70dcbf8d0a54))
* **print:** make builder print reliable via always-present #print-root (image-based, works without preview/audit) ([f4a2000](https://github.com/dogovor-expert/dogovor-expert-app/commit/f4a2000ab1e47538fa56be5450726fe7f8881eb8))
* **print:** print rendered page images via #print-root + window.print() instead of broken iframe/PDF-plugin ([9fe3e88](https://github.com/dogovor-expert/dogovor-expert-app/commit/9fe3e88397b925f72d0eaa8c923ae536e52ef62c))
* **scanner+api:** Scanic sanity-check, accept slug template_id ([09bee3c](https://github.com/dogovor-expert/dogovor-expert-app/commit/09bee3c98a8c9004c15d490031fdaf51d979e8b0))
* **scanner:** don't mangle Latin vehicle brand with latinToCyrillic ([23a9eec](https://github.com/dogovor-expert/dogovor-expert-app/commit/23a9eec94e50d76002c1a979f505f5408b3cc86a))
* **scanner:** trigger PaddleOCR fallback on short text, not only low confidence ([30bb6ae](https://github.com/dogovor-expert/dogovor-expert-app/commit/30bb6ae26d153f6e1111f41bd570c669c79d9c22))
* **security+ocr:** CSP wasm-unsafe-eval, chat meta=1, DocScanner improvements, env cleanup ([adba589](https://github.com/dogovor-expert/dogovor-expert-app/commit/adba589bfa0f4c939536ebd8e5eb821ca3c664e5))
* **security:** allow inline styles in style-src (CSP) ([e1f2312](https://github.com/dogovor-expert/dogovor-expert-app/commit/e1f231213b2147ba52af336a4d2c784d03d4f6a7))
* **security:** CSRF/rate-limit на списании, chat IDOR, приватный feedback-бакет, autoteka RLS + CSP/CI ([30868cf](https://github.com/dogovor-expert/dogovor-expert-app/commit/30868cfa5d6023d8c7aa34195edf1a397e2e13e1))
* **security:** pass nonce to server components via request headers (CSP) ([d666ef9](https://github.com/dogovor-expert/dogovor-expert-app/commit/d666ef960fa6bef513cd85944c56a50acc618adf))
* **seo:** add withSeo helper, fix metadata on 6 pages, block /auth and /builder in robots ([9beeb2d](https://github.com/dogovor-expert/dogovor-expert-app/commit/9beeb2d92ff609a2aa17bced1737879694bccfba))
* **seo:** Yandex Clean-param, kill soft-404, migrate blog to withSeo ([b7ec9e6](https://github.com/dogovor-expert/dogovor-expert-app/commit/b7ec9e6a7dc78128135bf09113a4c5129b8beff5))
* **ui:** a11y-контраст indigo-600, оверлеи над таббаром, aria-фиксы, ref поиска, Sentry-guard ([57530e0](https://github.com/dogovor-expert/dogovor-expert-app/commit/57530e004f685811be7287852eb19498b73f082c))
* **ui:** cookie-иконка в хедер + pb-28 на mobile для safe-area ([2e8316c](https://github.com/dogovor-expert/dogovor-expert-app/commit/2e8316c0ba1349a24f7ec6bac6283a0f910dd810))
* **ui:** correct paddle worker path for webpack bundling ([766ea0e](https://github.com/dogovor-expert/dogovor-expert-app/commit/766ea0e46fa906da427bd37bba6ae54f71dbb453))
* **ui:** DOC-экспорт под выбранный шаблон, фикс прокрутки и поповера качества, кнопка «Печать» ([2f45777](https://github.com/dogovor-expert/dogovor-expert-app/commit/2f457779c80bcdff0f1ae42dd3c96584847123d5))
* **ui:** e2e-cookie и e2e-builder приведены к текущему UI ([ca9c81c](https://github.com/dogovor-expert/dogovor-expert-app/commit/ca9c81c0b7e8eb35befe3924c910c364a80391f0))
* **ui:** improve passport and vehicle field extraction for real OCR layout ([626b978](https://github.com/dogovor-expert/dogovor-expert-app/commit/626b978da78370219295c18b31e75f73cf03e588))
* **ui:** mount Inssmart widget script inside container, use /eosago product ([3d4da26](https://github.com/dogovor-expert/dogovor-expert-app/commit/3d4da2658d6ac333f891ac75c4020a201ce74121))
* **ui:** scanner always visible, PTS/STS for all car_ templates, enhanced VUC parsing ([4813b4c](https://github.com/dogovor-expert/dogovor-expert-app/commit/4813b4c2d7e58a288e99dae6721305cd91545e86))
* **ui:** use || fallback for inssmart envs and fix staging build-arg brace typo ([b39a28b](https://github.com/dogovor-expert/dogovor-expert-app/commit/b39a28b8fe2cb50043296bf6c0892d5bcd04e9c6))
* **ui:** акция PRO 299 ₽ снова показывается в интерфейсе ([fbd9069](https://github.com/dogovor-expert/dogovor-expert-app/commit/fbd90699cc2a89529c315593623b87e6b39abc8a))
* **ui:** закрытие поповера качества и drawer резюме по Esc и клику вне ([c5921f0](https://github.com/dogovor-expert/dogovor-expert-app/commit/c5921f0eec64a9576d56723df77e03f648c25805))
* **ui:** контекстный CTA калькуляторов и параметр ?template ([acbc45b](https://github.com/dogovor-expert/dogovor-expert-app/commit/acbc45b1946f7ab5a526777b0bff86e93380a01d))
* **ui:** скрыть скроллбар левого меню и авто-масштаб превью резюме на мобильных ([cd0e6a4](https://github.com/dogovor-expert/dogovor-expert-app/commit/cd0e6a4243895499273485cb24fce0da4b1a1d54))
* **ui:** фирменная палитра шаблонов и новый UI конструктора резюме ([7da0a1d](https://github.com/dogovor-expert/dogovor-expert-app/commit/7da0a1d87edc54724651c285382153c581745a1b))
* **vault:** P0 — replace subtle.wrapKey with raw-bytes envelope (InvalidAccessError in all browsers); add crypto unit test + Playwright E2E; allow jivo http styles in CSP ([6865e1c](https://github.com/dogovor-expert/dogovor-expert-app/commit/6865e1c34e75dd7c59e03c5f4e78b0db2c9451a2))
* **vault:** silent re-unlock via deviceKey + passphrase dialog on vault ops; cloud-connect discoverability in documents ([7921084](https://github.com/dogovor-expert/dogovor-expert-app/commit/7921084750f03cd612c78f8bbeb8e9ce8370eb8e))
* пересоздание удалённой Telegram-темы при отправке сообщения чата ([b5135b2](https://github.com/dogovor-expert/dogovor-expert-app/commit/b5135b2c7f442d7095e255303570b469d4b7d5f5))
* правки по внешнему аудиту от 06.09 ([7d94ca5](https://github.com/dogovor-expert/dogovor-expert-app/commit/7d94ca549217daa470f83830109908ea9b863e91))
* усиление админ-действий, cron и биллинг-вебхука ([08036b8](https://github.com/dogovor-expert/dogovor-expert-app/commit/08036b8235a0ea45e2864a63302fc438212ee1a8))
* честные формулировки подписки — без водяных знаков и с ясной ролью УКЭП ([800006f](https://github.com/dogovor-expert/dogovor-expert-app/commit/800006fd0d9063484cd8b29eaef7e81957f1dbfc))


### Performance Improvements

* fix middleware public-route bug (367 SEO pages), self-host fonts via next/font, enable image optimization ([8d518af](https://github.com/dogovor-expert/dogovor-expert-app/commit/8d518afca1b97a3c355603bc72c41d42bc5cecbb))
* **fonts:** don't preload Playfair/JetBrains on login/dashboard - critical path ([b9f5fd3](https://github.com/dogovor-expert/dogovor-expert-app/commit/b9f5fd3d2ccf164eb22376a452dad9f953e1fb5d))
* **login:** lazy load TurnstileCaptcha + CountdownTimer, add preconnects ([e37f35d](https://github.com/dogovor-expert/dogovor-expert-app/commit/e37f35df5bb3a25cf5344f5f4c88d0ae281e1612))
* **p0:** force-static on public catalogs to activate Vercel ISR; add sameAs placeholder for brand protection ([d7b3c00](https://github.com/dogovor-expert/dogovor-expert-app/commit/d7b3c001d9d82d7175b4e9d928331ea07cbaaa74))
* **p0:** force-static on remaining public pages (about, contacts, dkp, documents, /, techosmotr, tahograph) ([6a72f75](https://github.com/dogovor-expert/dogovor-expert-app/commit/6a72f75ef91b2a8a427a898fde4a9a4d0e835d98))
* **perf:** одно ядро tesseract (simd) и превью в AVIF - уменьшен размер деплоя ([9038109](https://github.com/dogovor-expert/dogovor-expert-app/commit/9038109945c06900bb7d58bf76af70291e982c08))


### Reverts

* **middleware:** restore original CSP (strict-dynamic + nonce) ([1dbfb9c](https://github.com/dogovor-expert/dogovor-expert-app/commit/1dbfb9c7942f5a460c42bcaa753a02f11ffce6fe))


### Documentation

* add document/blank mechanics guide for AI agents ([15a54c5](https://github.com/dogovor-expert/dogovor-expert-app/commit/15a54c5e0c98f0119a723cc353db4ebea2f23aca))
* add llms.txt for AI agents ([fd2a3c3](https://github.com/dogovor-expert/dogovor-expert-app/commit/fd2a3c3312f89feaf656e318d11bd7c3d6f10c51))
* docs/GROWTH_PLAN.md — полный blueprint роста (вкл. Яндекс.РСЯ) ([b714dca](https://github.com/dogovor-expert/dogovor-expert-app/commit/b714dcafb6b8e60e29c6e1170111789870c6e32c))
* **legal:** confirm courtFeeAppeal fixed rates per FZ 259-FZ, cite KS RF 16-P ([71915bb](https://github.com/dogovor-expert/dogovor-expert-app/commit/71915bbe8b8c714a630f6aa29dbc2257935609d6))
* README переписан в продуктовую витрину, без инструкции установки ([071325b](https://github.com/dogovor-expert/dogovor-expert-app/commit/071325b0abafd1cd4b072bfc48acb361e93af223))
* **scanner-v2:** detail реализация CLAHE, validators, WebGPU, авто-классификация ([e75414e](https://github.com/dogovor-expert/dogovor-expert-app/commit/e75414e49d1a3c066706eddb714ea0584f5a8b33))
* **scanner-v2:** Фаза 5 — сканер знает все поля, определяет нужные сканы ([b5967cc](https://github.com/dogovor-expert/dogovor-expert-app/commit/b5967ccfd47c21b33ab434ea7fab6e31ce422ae9))


### Miscellaneous

* add vercelignore ([5c52053](https://github.com/dogovor-expert/dogovor-expert-app/commit/5c5205314b0ce858dfb7a39ca4ef57fb69b6d07b))
* **audit:** zero ESLint warnings, VDS docs, support launcher redesign ([8edfeaf](https://github.com/dogovor-expert/dogovor-expert-app/commit/8edfeafc622dee671b4cbf433a80a6ab2bf1b125))
* baseline после Фазы 0 — тест-инфраструктура (vitest/playwright), сплит legalTemplates на 9 файлов, фиксы decline/autosave ([2c0c527](https://github.com/dogovor-expert/dogovor-expert-app/commit/2c0c5278c6026ca9dc2a1d8ce8edaf43a3480ec2))
* **ci:** add captain-definition for CapRover git builds ([ddfecac](https://github.com/dogovor-expert/dogovor-expert-app/commit/ddfecaccc5fd20fa3582f0ca6186bdff82288a1a))
* **ci:** add gitleaks secret scan to pre-commit ([b2516f8](https://github.com/dogovor-expert/dogovor-expert-app/commit/b2516f82c2a1085220627d6b5e017744079367ad))
* **ci:** re-trigger prod deploy ([02516b9](https://github.com/dogovor-expert/dogovor-expert-app/commit/02516b93cddce89837251d8abe2d52d1d58fa639))
* commit outstanding source changes and audit artifacts ([19e7564](https://github.com/dogovor-expert/dogovor-expert-app/commit/19e7564001c54777d42d8f4c22435be26488f2a2))
* **deps:** remove PostHog integration ([75584ac](https://github.com/dogovor-expert/dogovor-expert-app/commit/75584ac41b8097113cd9741f8f67e0a138b16226))
* re-trigger Release Please ([d60225c](https://github.com/dogovor-expert/dogovor-expert-app/commit/d60225c2bd7950e9bfcba1806d0450e92692090e))
* trigger prod redeploy (CapRover) ([29c4e10](https://github.com/dogovor-expert/dogovor-expert-app/commit/29c4e10373c607af35947e1048669084d083a340))
* trigger redeploy to apply CRON_SECRET env ([fd7a33e](https://github.com/dogovor-expert/dogovor-expert-app/commit/fd7a33e852cfeb94939f293ce366bac20d0f3750))
* trigger staging rebuild (MFA device trust E2E) ([f5bc817](https://github.com/dogovor-expert/dogovor-expert-app/commit/f5bc81773a390b83061c8c7a99c924de84c7f650))
* контрольный триггер деплоя после переподключения git ([ced4010](https://github.com/dogovor-expert/dogovor-expert-app/commit/ced40103beb0d6dd85f5a743a5d6792628c285ff))
* подготовка репозитория к переносу на self-hosted (Coolify+Supabase+Next.js, FirstVDS) ([898d932](https://github.com/dogovor-expert/dogovor-expert-app/commit/898d93240796c44554074b81b583605a3487f325))
* проверка git-связи Vercel после репейма ([da22be0](https://github.com/dogovor-expert/dogovor-expert-app/commit/da22be0a3d8d824ba1c2d374716b05dd99f03622))
* триггер с корректным автором ([22707fd](https://github.com/dogovor-expert/dogovor-expert-app/commit/22707fdf2b424ad2067ef22c7d49e963ff650d93))


### CI/CD

* **ci:** build-args NEXT_PUBLIC_* через vars/inputs для GHCR сборки ([6d46006](https://github.com/dogovor-expert/dogovor-expert-app/commit/6d46006deea22b34a0f802adc0b1f5144854a847))
* **ci:** workflow сборки GHCR образа production с build-args ([1615a5f](https://github.com/dogovor-expert/dogovor-expert-app/commit/1615a5f1b5ca242399fdfaf3b3d1c5e68fe8f50f))
* **ci:** автодеплой из GitHub Actions в CapRover (deploy-from-github, app token) ([0bc01fe](https://github.com/dogovor-expert/dogovor-expert-app/commit/0bc01febf85e56ab6ca6df6e1812b71fc2578ac4))
* **ci:** сборка и пуш образа в GHCR для staging-деплоя CapRover ([13589e3](https://github.com/dogovor-expert/dogovor-expert-app/commit/13589e3ec36371f56ffbbb0835e180181b509293))
* remove GHCR workflows, prod deploy via CapRover push-webhook ([24e9612](https://github.com/dogovor-expert/dogovor-expert-app/commit/24e9612a51ad82e653e5fe23a8ae48f59c3e8935))
* retry CI after stuck runs ([57e146f](https://github.com/dogovor-expert/dogovor-expert-app/commit/57e146fb62e3b0ab7f82d9b130a8fddd8e52ee96))
* авто-синхронизация master из production и инвариант веток в документации ([1ef43e6](https://github.com/dogovor-expert/dogovor-expert-app/commit/1ef43e6fd58087eb9bb96dd4871f0f30e54786bc))
* добавить .editorconfig и правила среды выполнения ([368891e](https://github.com/dogovor-expert/dogovor-expert-app/commit/368891eb9c28e9bfad7ea94ef86a4f37c77c2010))

## [Unreleased]

### Features
- Granular cookies consent (GDPR Art. 7(2)): категории necessary/analytics/marketing
- Persistent иконка 🍪 для отзыва согласия
- 3 равноправные кнопки: «Принять всё», «Только необходимые», «Настроить»
- A11y: Escape, focus-trap, autoFocus, aria-live в cookies-баннере

### Bug Fixes
- YandexMetrikaPageView: теперь реагирует на accept без перезагрузки страницы

### CI/CD
- BLAST RADIUS протокол: `scripts/check-blast-radius.mjs` для поиска зависимостей
- vitest related: тесты только для изменённых файлов
- Smoke-тесты: 5 базовых сценариев жизнеспособности сайта
- Pre-commit: typecheck + lint + blast radius + vitest related

### Documentation
- Стандарт agents.md (Linux Foundation)
- Вложенные AGENTS.md: src/lib/supabase, src/components, src/app/api, src/app/admin
- IDE-обёртки: CLAUDE.md, .cursorrules, .clinerules, .windsurfrules, .github/copilot-instructions.md
- ADR-шаблоны в `docs/adr/`
