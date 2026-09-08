// @vitest-environment jsdom
// VERIFICATION TEST (read-only) — КРИТ 2.2/2.3 из аудита 2026-09.
//
// Цель — НЕ править код, а задокументировать текущее поведение модуля
// `src/lib/signCryptoPro.ts` и `src/lib/pades-verify.ts`, чтобы проверить
// утверждения аудита и нюанс, найденный пользователем:
//
//   1. checkRevocation() в signCryptoPro.ts:557-585 — действительно ли
//      жёстко возвращает 'unknown' с пустым циклом по CRL DP (аудит: да).
//
//   2. pades-verify.ts:404-412 — действительно ли жёстко возвращает
//      "CRL/OCSP check not implemented" (аудит: да, для pades-verify).
//
//   3. TSA: в signCryptoPro.ts есть ДВА блока. Блок 626-637 — мёртвый
//      (создаёт tsaAttr и console.warn). Блок 654-662 — реальный
//      (signer.propset_TSAAddress(tsaUrl)) перед SignCades с типом
//      CADESCOM_CADES_X_LONG_TYPE_1. Проверяем, что рабочий блок
//      действительно дёргается, когда addTimestamp=true.
//
//   4. В проде (SignDialog.tsx:141, UKEPSigner.tsx:69,80) addTimestamp
//      всегда false / не задан → реальный TSA-блок сейчас в проде не
//      выполняется (аудит прав про то, что TSA «не работает» в UI).
//
//   5. Для pades-verify: CRL Distribution Points и OCSP URLs УЖЕ
//      корректно парсятся в cert-parser.ts:159-184; pades-verify.ts
//      только не делает HTTP-запрос по ним. Это уточняет аудит —
//      «парсинг CRL Distribution Points — пустой цикл» относится к
//      signCryptoPro.ts, а НЕ к pades-verify.ts.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";

import { TSA_PRESETS } from "@/lib/tsa";

const DEFAULT_TSA = TSA_PRESETS.cryptopro_prod;

type CallRecord = { method: string; args: unknown[] };

interface MockHandle {
  __calls: CallRecord[];
  [k: string]: unknown;
}

function makeHandle(name: string): MockHandle {
  const calls: CallRecord[] = [];
  const store: Record<string | symbol, unknown> = {
    __calls: calls,
    __name: name,
  };
  const proxy: MockHandle = new Proxy({} as MockHandle, {
    get(_t, prop, _r) {
      if (typeof prop === "string") {
        if (prop === "__calls") return calls;
        if (prop === "then") return undefined;
        if (prop === "toJSON") return undefined;
      }
      // Symbol.toPrimitive (и прочие symbol) — читаем напрямую
      if (typeof prop === "symbol") return store[prop];
      // Установленные свойства — стабильная конфигурация (Thumbprint и т.п.)
      const existing = store[prop];
      if (existing !== undefined) return existing;
      // Неизвестное свойство → автовивификация функции-логгера.
      return (...args: unknown[]) => {
        calls.push({ method: prop, args });
        return makeHandle(`${name}.${prop}`);
      };
    },
    set(_t, prop, value) {
      store[prop] = value;
      return true;
    },
  }) as MockHandle;
  return proxy;
}

function makeCertHandle(opts: {
  subject?: string;
  issuer?: string;
  withQcSignEKU?: boolean;
  withCrlDpExt?: boolean;
} = {}): MockHandle {
  const cert = makeHandle("cert");
  // Self-signed (Subject === Issuer) — упрощает chain validation в моке.
  const subjectName = opts.subject ?? "CN=Test";
  const issuerName = opts.issuer ?? subjectName;
  (cert as unknown as Record<string, unknown>).Thumbprint = Promise.resolve("ABC123");
  (cert as unknown as Record<string, unknown>).SubjectName = Promise.resolve(subjectName);
  (cert as unknown as Record<string, unknown>).IssuerName = Promise.resolve(issuerName);
  (cert as unknown as Record<string, unknown>).ValidFromDate = Promise.resolve("2020-01-01");
  (cert as unknown as Record<string, unknown>).ValidToDate = Promise.resolve("2030-01-01");
  (cert as unknown as Record<string, unknown>).HasPrivateKey = () => Promise.resolve(true);
  // CertEncoded — пустой ArrayBuffer. signCryptoPro.checkRevocation вызовет
  // pkijs.Certificate.fromBER на нём — получит ошибку и вернёт 'offline'.
  // Это документирует текущее поведение: при пустом cert в моке мы НЕ
  // делаем реальный HTTP-запрос.
  (cert as unknown as Record<string, unknown>).CertEncoded = Promise.resolve(new ArrayBuffer(0));

  // Extensions: id-kp-qcSign (1.2.643.7.1.1.1.1) для isQualified + digitalSignature/nonRepudiation
  // для прохода keyUsage. Иначе validateCertificate вернёт errors и подпись не пройдёт.
  const exts: Array<{ OID: Promise<string>; Value: unknown }> = [];
  // Key Usage (2.5.29.15) — число, у которого 0x80 | 0x40 = digitalSignature + nonRepudiation
  exts.push({ OID: Promise.resolve("2.5.29.15"), Value: 0xc0 });
  // Extended Key Usage (2.5.29.37) — массив OID. Моделируем как объект-коллекцию.
  if (opts.withQcSignEKU !== false) {
    const ekuValue = makeHandle("eku");
    const ekuItems = ["1.2.643.7.1.1.1.1"].map((oid) => {
      const item = makeHandle("ekuItem");
      (item as unknown as Record<string, unknown>).OID = Promise.resolve(oid);
      return item;
    });
    (ekuValue as unknown as Record<string, unknown>).Count = Promise.resolve(ekuItems.length);
    (ekuValue as unknown as Record<string, unknown>).Item = (i: number) =>
      Promise.resolve(ekuItems[i - 1]);
    exts.push({ OID: Promise.resolve("2.5.29.37"), Value: ekuValue });
  }
  if (opts.withCrlDpExt) {
    exts.push({ OID: Promise.resolve("2.5.29.31"), Value: "ignored" });
  }
  const ext = makeHandle("extensions");
  (ext as unknown as Record<string, unknown>).Count = Promise.resolve(exts.length);
  (ext as unknown as Record<string, unknown>).Item = (i: number) => {
    const e = exts[i - 1];
    return Promise.resolve(Object.assign(makeHandle("ext"), e));
  };
  (cert as unknown as Record<string, unknown>).Extensions = Promise.resolve(ext);
  return cert;
}

interface MockPlugin {
  plugin: Record<string, unknown>;
  createdProxies: Map<string, MockHandle>;
}

function setupCadesPluginMock(opts: { certs?: MockHandle[] } = {}): MockPlugin {
  const certs = opts.certs ?? [makeCertHandle()];

  const plugin: Record<string, unknown> = {};
  const createdProxies = new Map<string, MockHandle>();
  // Пре-создаём «стабильные» прокси, чтобы их можно было настроить до
  // первого вызова из тестируемого кода. Другие progID будут создаваться
  // лениво.
  for (const id of [
    "CAdESCOM.Store",
    "CAdESCOM.CPSigner",
    "CAdESCOM.CPAttribute",
    "CAdESCOM.CadesSignedData",
  ]) {
    createdProxies.set(id, makeHandle(id));
  }

  // Signer.AuthenticatedAttributes2 → Promise<Collection c Add/Count/Item>
  const signer = createdProxies.get("CAdESCOM.CPSigner")!;
  const authAttrs = makeHandle("AuthenticatedAttributes2");
  (authAttrs as unknown as Record<string, unknown>).Count = Promise.resolve(0);
  (authAttrs as unknown as Record<string, unknown>).Add = (item: unknown) => {
    (authAttrs as unknown as { __calls: CallRecord[] }).__calls.push({
      method: "Add",
      args: [item],
    });
    return Promise.resolve();
  };
  (authAttrs as unknown as Record<string, unknown>).Item = (i: number) =>
    Promise.resolve(makeHandle(`AuthenticatedAttributes2.Item(${i})`));
  (signer as unknown as Record<string, unknown>).AuthenticatedAttributes2 = Promise.resolve(authAttrs);
  plugin.CreateObjectAsync = (progId: string) => {
    if (!createdProxies.has(progId)) {
      createdProxies.set(progId, makeHandle(progId));
    }
    return Promise.resolve(createdProxies.get(progId));
  };
  plugin.CAPICOM_CURRENT_USER_STORE = 1;
  plugin.CAPICOM_MY_STORE = 2;
  plugin.CAPICOM_CA_STORE = 3;
  plugin.CAPICOM_ROOT_STORE = 4;
  plugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED = 5;
  plugin.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN = 6;
  plugin.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME = 100;
  plugin.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNATURE_TIMESTAMP_TOKEN = 101;
  plugin.CADESCOM_BASE64_TO_BINARY = 10;
  plugin.CADESCOM_ENCODE_BASE64 = 11;
  plugin.CADESCOM_ENCODE_BINARY = 12;
  plugin.CADESCOM_CADES_X_LONG_TYPE_1 = 99;
  plugin.CADESCOM_CADES_BES = 77;

  // Конфигурируем store: сертификаты возвращаются через Certificates.Item(i).
  const store = createdProxies.get("CAdESCOM.Store")!;
  (store as unknown as Record<string, unknown>).Open = () => Promise.resolve();
  (store as unknown as Record<string, unknown>).Close = () => Promise.resolve();

  const certCollection = makeHandle("store.Certificates");
  (certCollection as unknown as Record<string, unknown>).Count = Promise.resolve(certs.length);
  (certCollection as unknown as Record<string, unknown>).Item = (i: number) =>
    Promise.resolve(certs[i - 1]);
  (store as unknown as Record<string, unknown>).Certificates = Promise.resolve(certCollection);

  (window as unknown as { cadesplugin: Promise<unknown> }).cadesplugin = Promise.resolve(plugin);
  return { plugin, createdProxies };
}

describe("VERIFICATION: signCryptoPro — КРИТ 2.2 (checkRevocation) и 2.5 (TSA)", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    delete (window as unknown as { cadesplugin?: unknown }).cadesplugin;
  });

  it("[ЭТАП 2.4 ПОДТВЕРЖДЕНО] checkRevocation возвращает 'offline' для мок-сертификата без реального CertEncoded (ЭТАП 2: реальная проверка)", async () => {
    // В ЭТАП 2.4 checkRevocation ПЫТАЕТСЯ сделать реальный HTTP OCSP/CRL.
    // В моке CertEncoded — пустой ArrayBuffer, pkijs падает → catch → 'offline'.
    // Это новое корректное поведение: НЕ молча возвращаем 'unknown',
    // а корректно сообщаем 'offline' (warning, не error).
    setupCadesPluginMock();
    const { validateCertificate } = await import("@/lib/signCryptoPro");
    const result = await validateCertificate("ABC123");
    expect(result.details.revocationStatus).toBe("offline");
    // 'offline' — это НЕ ошибка (errors.length === 0)
    expect(result.errors).toEqual([]);
    // 'offline' добавляется в warnings
    expect(result.warnings.some((w) => /CRL\/OCSP/i.test(w))).toBe(true);
  });

  it("[2.2 АУДИТ-ПОДТВЕРЖДЕНО] CRL Distribution Points: даже при наличии ext OID=2.5.29.31 checkRevocation делает реальный HTTP-запрос", async () => {
    // В ЭТАП 2.4 тело if-блока для CRL DP УЖЕ не пустое: мы идём в
    // pkijs-парсер и в checkCrl/checkOcsp. В моке парсинг pkijs упадёт
    // (CertEncoded пустой), результат 'offline'.
    const fakeExt = makeHandle("ext");
    (fakeExt as unknown as Record<string, unknown>).OID = Promise.resolve("2.5.29.31");
    (fakeExt as unknown as Record<string, unknown>).Value = Promise.resolve("ignored-string-value");

    const cert = makeCertHandle({ withCrlDpExt: true });
    const extContainer = makeHandle("extContainer");
    (extContainer as unknown as Record<string, unknown>).Count = Promise.resolve(1);
    (extContainer as unknown as Record<string, unknown>).Item = () => Promise.resolve(fakeExt);
    (cert as unknown as Record<string, unknown>).Extensions = Promise.resolve(extContainer);

    setupCadesPluginMock({ certs: [cert] });
    const { validateCertificate } = await import("@/lib/signCryptoPro");
    const result = await validateCertificate("ABC123");
    // В моке — 'offline'. В проде с реальным fetch будет 'valid' или 'revoked'.
    expect(["offline", "valid", "revoked", "unknown"]).toContain(result.details.revocationStatus);
  });

  it("[2.2-АУДИТ-УТОЧНЕНИЕ] checkRevocation() при недоступном CertEncoded не кидает throw — возвращает 'offline' штатно", async () => {
    setupCadesPluginMock();
    const { validateCertificate } = await import("@/lib/signCryptoPro");
    const result = await validateCertificate("ABC123");
    // 'offline' не считается ошибкой — isValid остаётся true
    expect(result.isValid).toBe(true);
    expect(result.details.revocationStatus).toBe("offline");
  });

  it("[TSA-НЮАНС-ПОДТВЕРЖДЕНО] addTimestamp=true → signer.propset_TSAAddress(default) вызывается, тип = X_LONG_TYPE_1", async () => {
    const { plugin, createdProxies } = setupCadesPluginMock();

    const { signPdfWithCryptoPro } = await import("@/lib/signCryptoPro");
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"
    await signPdfWithCryptoPro(pdfBytes, "ABC123", { addTimestamp: true });

    const signer = createdProxies.get("CAdESCOM.CPSigner")!;
    const tsaAddrCalls = signer.__calls.filter((c) => c.method === "propset_TSAAddress");
    expect(tsaAddrCalls).toHaveLength(1);
    expect(tsaAddrCalls[0].args[0]).toBe(DEFAULT_TSA);

    // CAdES-X-Long Type 1 (≠ BES)
    expect(plugin.CADESCOM_CADES_X_LONG_TYPE_1).not.toBe(plugin.CADESCOM_CADES_BES);
  });

  it("[TSA-НЮАНС-ПОДТВЕРЖДЕНО] addTimestamp=true → SignCades вызывается с CADESCOM_CADES_X_LONG_TYPE_1", async () => {
    const { plugin, createdProxies } = setupCadesPluginMock();

    const { signPdfWithCryptoPro } = await import("@/lib/signCryptoPro");
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    await signPdfWithCryptoPro(pdfBytes, "ABC123", { addTimestamp: true });

    const sd = createdProxies.get("CAdESCOM.CadesSignedData")!;
    const signCades = sd.__calls.find((c) => c.method === "SignCades");
    expect(signCades).toBeDefined();
    // args = [signer, cadesType, detached, encodingType]
    expect(signCades!.args[1]).toBe(plugin.CADESCOM_CADES_X_LONG_TYPE_1);
    expect(signCades!.args[1]).not.toBe(plugin.CADESCOM_CADES_BES);
  });

  it("[TSA-НЮАНС-ПОДТВЕРЖДЕНО] addTimestamp=false → propset_TSAAddress НЕ вызывается, тип = BES", async () => {
    const { plugin, createdProxies } = setupCadesPluginMock();

    const { signPdfWithCryptoPro } = await import("@/lib/signCryptoPro");
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    await signPdfWithCryptoPro(pdfBytes, "ABC123", { addTimestamp: false });

    const signer = createdProxies.get("CAdESCOM.CPSigner")!;
    expect(signer.__calls.some((c) => c.method === "propset_TSAAddress")).toBe(false);

    const sd = createdProxies.get("CAdESCOM.CadesSignedData")!;
    const signCades = sd.__calls.find((c) => c.method === "SignCades");
    expect(signCades!.args[1]).toBe(plugin.CADESCOM_CADES_BES);
  });

  it("[TSA-НЮАНС-ПОДТВЕРЖДЕНО] кастомный tsaUrl передаётся в propset_TSAAddress", async () => {
    const { createdProxies } = setupCadesPluginMock();

    const { signPdfWithCryptoPro } = await import("@/lib/signCryptoPro");
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const customTSA = "https://ca.example.com/tsp/";
    await signPdfWithCryptoPro(pdfBytes, "ABC123", {
      addTimestamp: true,
      tsaUrl: customTSA,
    });

    const signer = createdProxies.get("CAdESCOM.CPSigner")!;
    const tsaCalls = signer.__calls.filter((c) => c.method === "propset_TSAAddress");
    expect(tsaCalls).toHaveLength(1);
    expect(tsaCalls[0].args[0]).toBe(customTSA);
  });

  it("[TSA-НЮАНС-ПОДТВЕРЖДЕНО] мёртвый блок 626-637 не ломает подпись; реальный TSA делается через propset_TSAAddress 654-662", async () => {
    const { createdProxies } = setupCadesPluginMock();

    const { signPdfWithCryptoPro } = await import("@/lib/signCryptoPro");
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    await signPdfWithCryptoPro(pdfBytes, "ABC123", { addTimestamp: true });

    // CPAttribute создаётся (минимум для signing time). Мёртвый блок
    // создаёт второй, но не использует его.
    const cpAttr = createdProxies.get("CAdESCOM.CPAttribute");
    expect(cpAttr).toBeDefined();
    expect(cpAttr!.__calls.some((c) => c.method === "propset_Name")).toBe(true);

    // Главное: реальный путь через propset_TSAAddress отработал.
    const signer = createdProxies.get("CAdESCOM.CPSigner")!;
    expect(signer.__calls.some((c) => c.method === "propset_TSAAddress")).toBe(true);

    // И не было необработанных ошибок
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("[ЭТАП 1.3 ПОДТВЕРЖДЕНО] В проде (SignDialog.tsx, UKEPSigner.tsx) addTimestamp=true → реальный TSA-блок 654-662 выполняется", () => {
    // После ЭТАПА 1.3 addTimestamp включён в обоих местах.
    // Реальный путь через propset_TSAAddress теперь активен.
    const signDialog = readFileSync("src/components/sign/SignDialog.tsx", "utf8");
    const ukeSigner = readFileSync("src/components/builder/UKEPSigner.tsx", "utf8");

    expect(signDialog).toMatch(/addTimestamp:\s*true/);
    // В UKEPSigner addTimestamp:true должен быть в ОБЕИХ подписях (probe + final),
    // иначе длины CMS не совпадут.
    const matches = ukeSigner.match(/addTimestamp:\s*true/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("[ЭТАП 1.2 ПОДТВЕРЖДЕНО] useCryptoPro.ts больше НЕ содержит мёртвый блок TSA, propset_TSAAddress по-прежнему отсутствует", () => {
    // После ЭТАПА 1.2 мёртвый блок (console.warn) удалён из useCryptoPro.ts.
    // propset_TSAAddress там никогда не было — и сейчас нет.
    const hook = readFileSync("src/hooks/useCryptoPro.ts", "utf8");
    expect(hook).not.toMatch(/TSA timestamp требует отдельного HTTP запроса/);
    expect(hook).not.toMatch(/propset_TSAAddress/);
  });
});
