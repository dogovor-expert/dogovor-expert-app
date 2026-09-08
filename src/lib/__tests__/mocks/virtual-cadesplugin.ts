// VirtualCadesPlugin — эмулятор КриптоПро Browser Plugin для офлайн-тестов УКЭП.
//
// Реализует интерфейс `CadesPlugin` из `src/lib/signCryptoPro.ts`, но вместо
// COM-объектов подписывает данные напрямую через node-gost-crypto
// (GOST Р 34.10-2012/256 / ГОСТ Р 34.11-2012-256). При вызове
// `propset_TSAAddress` (или cadesType = CADESCOM_CADES_X_LONG_TYPE_1) в
// unsignedAttrs подписанной CMS добавляется атрибут штампа времени
// `1.2.840.113549.1.9.16.2.14` (id-smime-aa-timeStampToken) через pkijs
// поверх готовой CMS — unsignedAttrs не входят в подпись, поэтому ГОСТ-подпись
// остаётся валидной.

import { gostCrypto } from "node-gost-crypto";
import * as pkijs from "pkijs";
import * as asn1js from "asn1js";
import { createHash } from "node:crypto";

export const TSA_TIMESTAMP_OID = "1.2.840.113549.1.9.16.2.14";

// Минимальный корректный DER структуры ContentInfo pkcs7-data (пустой TST-токен).
const TSA_OCTECTS = [0x30, 0x0c, 0x06, 0x08, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x04, 0x00];

const OID = {
  KEY_USAGE: "2.5.29.15",
  EXTENDED_KEY_USAGE: "2.5.29.37",
  QC_SIGN: "1.2.643.7.1.1.1.1",
};

const TRUSTED_CA_NAME = "АО «Удостоверяющий центр «КриптоПро»";
const LEAF_CN = "Иванов Иван Иванович";
const CA_DN = `CN=Test CA, O=${TRUSTED_CA_NAME}, C=RU`;

export interface VirtualGostPki {
  cert: InstanceType<typeof gostCrypto.cert.X509>;
  privateKey: unknown;
  der: Uint8Array;
  derBase64: string;
  thumbprint: string;
}

/** Создаёт самоподписанный ГОСТ-сертификат и ключ (node-gost-crypto). */
export async function createVirtualGostPki(): Promise<VirtualGostPki> {
  const cert = new gostCrypto.cert.X509({
    subject: { countryName: "RU", commonName: LEAF_CN, organizationName: "ООО «Витрина Договоров»" },
  });
  const privateKey = await cert.generate("TC-256");
  await cert.sign(privateKey);
  const der = new Uint8Array(cert.encode("DER"));
  const thumbprint = createHash("sha1").update(Buffer.from(der)).digest("hex").toUpperCase();
  return { cert, privateKey, der, derBase64: Buffer.from(der).toString("base64"), thumbprint };
}

/**
 * Пост-обработка CMS через pkijs:
 *  1) делает CMS ОТКРЕПЛЁННОЙ (detached) — удаляет eContent из encapContentInfo
 *     (по PAdES/ISO 32000-1 тело документа НЕ дублируется внутри CMS);
 *  2) при needTsa добавляет атрибут timeStampToken в unsignedAttrs.
 * node-gost подписывает только signedAttrs (messageDigest от контента), поэтому
 * detachment не нарушает валидность ГОСТ-подписи.
 */
export function attachTsaTimestampToCms(cmsDer: Uint8Array, needTsa = true): Uint8Array {
  const arrayBuffer = cmsDer.buffer.slice(cmsDer.byteOffset, cmsDer.byteOffset + cmsDer.byteLength) as ArrayBuffer;
  const contentInfo = pkijs.ContentInfo.fromBER(arrayBuffer);
  if (contentInfo.contentType !== pkijs.ContentInfo.SIGNED_DATA) {
    throw new Error("CMS is not SignedData");
  }
  const signedData = new pkijs.SignedData({ schema: contentInfo.content });
  // Открепляем: в detached-подписи encapContentInfo.eContent отсутствует (RFC 5652 / PAdES).
  delete (signedData.encapContentInfo as { eContent?: unknown }).eContent;
  if (needTsa) {
    const signerInfo = signedData.signerInfos[0];
    if (!signerInfo) throw new Error("No signerInfo in CMS");
    const attr = new pkijs.Attribute({
      type: TSA_TIMESTAMP_OID,
      values: [new asn1js.OctetString({ valueHex: Uint8Array.from(TSA_OCTECTS).buffer })],
    });
    signerInfo.unsignedAttrs = new pkijs.SignedAndUnsignedAttributes({ type: 1, attributes: [attr] });
  }
  contentInfo.content = signedData.toSchema();
  return new Uint8Array(contentInfo.toSchema().toBER(false));
}

type CallRecord = { method: string; args: unknown[] };

function makeHandle(name: string): Record<string, unknown> {
  const calls: CallRecord[] = [];
  const store: Record<string | symbol, unknown> = { __calls: calls, __name: name };
  const proxy = new Proxy({} as Record<string, unknown>, {
    get(_t, prop) {
      if (typeof prop === "string") {
        if (prop === "__calls") return calls;
        if (prop === "then") return undefined;
        if (prop === "toJSON") return undefined;
      }
      if (typeof prop === "symbol") return store[prop];
      const existing = store[prop];
      if (existing !== undefined) return existing;
      return (...args: unknown[]) => {
        calls.push({ method: prop, args });
        return makeHandle(`${name}.${prop}`);
      };
    },
    set(_t, prop, value) {
      store[prop] = value;
      return true;
    },
  });
  return proxy;
}

function makeCertInfo(options: {
  thumbprint: string;
  subject: string;
  issuer: string;
  from: string;
  to: string;
  withKeyUsage: boolean;
  ekuOids?: string[];
  certEncodedBase64?: string;
}): Record<string, unknown> {
  const cert = makeHandle("cert");
  cert.Thumbprint = Promise.resolve(options.thumbprint);
  cert.SubjectName = Promise.resolve(options.subject);
  cert.IssuerName = Promise.resolve(options.issuer);
  cert.ValidFromDate = Promise.resolve(options.from);
  cert.ValidToDate = Promise.resolve(options.to);
  cert.HasPrivateKey = () => Promise.resolve(true);
  if (options.certEncodedBase64 !== undefined) {
    cert.CertEncoded = Promise.resolve(options.certEncodedBase64);
  }
  const exts: Array<{ OID: Promise<string>; Value: unknown }> = [];
  if (options.withKeyUsage) {
    // 0xC0 = digitalSignature (0x80) | nonRepudiation (0x40)
    exts.push({ OID: Promise.resolve(OID.KEY_USAGE), Value: 0xc0 });
  }
  const ekuOids = options.ekuOids ?? [];
  if (ekuOids.length > 0) {
    const ekuItems = ekuOids.map((oid) => {
      const item = makeHandle("ekuItem");
      item.OID = Promise.resolve(oid);
      return item;
    });
    const ekuValue = makeHandle("eku");
    ekuValue.Count = Promise.resolve(ekuItems.length);
    ekuValue.Item = (i: number) => Promise.resolve(ekuItems[i - 1]);
    exts.push({ OID: Promise.resolve(OID.EXTENDED_KEY_USAGE), Value: ekuValue });
  }
  const extContainer = makeHandle("extensions");
  extContainer.Count = Promise.resolve(exts.length);
  extContainer.Item = (i: number) => {
    const e = exts[i - 1];
    return Promise.resolve(Object.assign(makeHandle("ext"), e));
  };
  cert.Extensions = Promise.resolve(extContainer);
  return cert;
}

class VirtualStore {
  private storeName = -1;
  constructor(
    private readonly myCerts: Record<string, unknown>[],
    private readonly caCerts: Record<string, unknown>[],
    private readonly rootCerts: Record<string, unknown>[],
  ) {}

  Open(_location: number, storeName: number, _mode: number): Promise<void> {
    this.storeName = storeName;
    return Promise.resolve();
  }

  Close(): Promise<void> {
    return Promise.resolve();
  }

  get Certificates(): Promise<{ Count: Promise<number>; Item(i: number): Promise<Record<string, unknown>> }> {
    // CAPICOM_MY_STORE=2, CAPICOM_CA_STORE=3, CAPICOM_ROOT_STORE=4
    const storeName = this.storeName;
    const collection = storeName === 3 ? this.caCerts : storeName === 4 ? this.rootCerts : this.myCerts;
    return Promise.resolve({
      Count: Promise.resolve(collection.length),
      Item: (i: number) => Promise.resolve(collection[i - 1] ?? makeHandle("emptyCert")),
    });
  }
}

/** Обычный (не Proxy) объект Store с getter на Certificates — совместим с `await store.Certificates`. */
function makeStoreObject(store: VirtualStore): Record<string, unknown> {
  return {
    Open: (loc: number, storeName: number, mode: number) => store.Open(loc, storeName, mode),
    Close: () => store.Close(),
    get Certificates() {
      return store.Certificates;
    },
  };
}

export interface VirtualCadesPluginResult {
  plugin: {
    CreateObjectAsync(progId: string): Promise<Record<string, unknown>>;
    [k: string]: unknown;
  };
  created: Map<string, Record<string, unknown>>;
}

/** Создаёт объект cadesplugin. Установка в window — в installVirtualCadesPlugin. */
export function createCadesPlugin(pki: VirtualGostPki): VirtualCadesPluginResult {
  const createdProxies = new Map<string, Record<string, unknown>>();

  // Лист (наш ГОСТ-сертификат) и тестовый CA, на котором заканчивается цепочка.
  const leafCert = makeCertInfo({
    thumbprint: pki.thumbprint,
    subject: `CN=${LEAF_CN}, ОГРН 0000000000000, C=RU`,
    issuer: CA_DN,
    from: "2020-01-01",
    to: "2035-01-01",
    withKeyUsage: true,
    ekuOids: [OID.QC_SIGN],
    certEncodedBase64: pki.derBase64,
  });
  const caCert = makeCertInfo({
    thumbprint: createHash("sha1").update(Buffer.from("test-ca")).digest("hex").toUpperCase(),
    subject: CA_DN,
    issuer: CA_DN,
    from: "2020-01-01",
    to: "2035-01-01",
    withKeyUsage: false,
  });

  const plugin: VirtualCadesPluginResult["plugin"] = {
    CreateObjectAsync: (progId: string) => Promise.resolve(getOrCreate(progId)),
    CAPICOM_CURRENT_USER_STORE: 1,
    CAPICOM_MY_STORE: 2,
    CAPICOM_CA_STORE: 3,
    CAPICOM_ROOT_STORE: 4,
    CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED: 5,
    CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN: 6,
    CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME: 100,
    CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNATURE_TIMESTAMP_TOKEN: 101,
    CADESCOM_BASE64_TO_BINARY: 10,
    CADESCOM_ENCODE_BASE64: 11,
    CADESCOM_ENCODE_BINARY: 12,
    CADESCOM_CADES_X_LONG_TYPE_1: 99,
    CADESCOM_CADES_BES: 77,
  };

  plugin.CreateObjectAsync ??= (progId: string) => Promise.resolve(getOrCreate(progId));

  function getOrCreate(progId: string): Record<string, unknown> {
    const existing = createdProxies.get(progId);
    if (existing) return existing;

    let handle: Record<string, unknown>;
    if (progId === "CAdESCOM.Store") {
      // Свежий экземпляр на каждый вызов: storeName (MY/CA/ROOT) задаётся
      // через Open и привязан к конкретному handle. Не кэшируем.
      const store = new VirtualStore([leafCert], [caCert], [caCert]);
      handle = makeStoreObject(store);
      createdProxies.set(progId, handle);
      return handle;
    } else if (progId === "CAdESCOM.CPSigner") {
      handle = makeHandle("CAdESCOM.CPSigner");
      const authAttrs = makeHandle("AuthenticatedAttributes2");
      authAttrs.Count = Promise.resolve(0);
      authAttrs.Add = () => Promise.resolve();
      authAttrs.Item = (i: number) => Promise.resolve(makeHandle(`attr${i}`));
      handle.AuthenticatedAttributes2 = Promise.resolve(authAttrs);
      let tsaAddress = "";
      handle.propset_TSAAddress = (url: string) => {
        tsaAddress = url;
        return Promise.resolve();
      };
      handle.__getTsaAddress = () => tsaAddress;
      handle.Signers = Promise.resolve({ Count: Promise.resolve(0), Item: () => Promise.resolve(makeHandle("signer")) });
    } else if (progId === "CAdESCOM.CPAttribute") {
      handle = makeHandle("CAdESCOM.CPAttribute");
      handle.propset_Name = () => Promise.resolve();
      handle.propset_Value = () => Promise.resolve();
    } else if (progId === "CAdESCOM.CadesSignedData") {
      handle = makeHandle("CAdESCOM.CadesSignedData");
      let contentBase64 = "";
      handle.propset_ContentEncoding = () => Promise.resolve();
      handle.propset_Content = (content: string) => {
        contentBase64 = content;
        return Promise.resolve();
      };
      handle.SignCades = async (_signer: unknown, cadesType: number) => {
        const contentBytes = Buffer.from(contentBase64, "base64");
        const contentAb = contentBytes.buffer.slice(contentBytes.byteOffset, contentBytes.byteOffset + contentBytes.byteLength) as ArrayBuffer;
        const cms = new gostCrypto.cms.SignedDataContentInfo();
        cms.setEnclosed({ contentType: "data", content: contentAb });
        gostCrypto.cms.options.autoAddCert = true;
        await cms.addSignature(pki.privateKey, pki.cert, true);
        let der: Uint8Array<ArrayBufferLike> = new Uint8Array(cms.encode("DER"));
        const signer = createdProxies.get("CAdESCOM.CPSigner") as Record<string, unknown> | undefined;
        const tsaSet = (signer?.__getTsaAddress as (() => string) | undefined)?.() !== "";
        // PAdES: CMS обязана быть ОТКРЕПЛЁННОЙ (тело документа не дублируется в eContent).
        // TSA-штамп добавляется при tsaSet или cadesType=99 (X-Long).
        der = attachTsaTimestampToCms(der, tsaSet || cadesType === 99);
        return Buffer.from(der).toString("base64");
      };
      handle.VerifyCades = () => Promise.resolve();
    } else {
      handle = makeHandle(progId);
    }
    createdProxies.set(progId, handle);
    return handle;
  }

  return { plugin, created: createdProxies };
}

/**
 * Устанавливает cadesplugin в window (для node-тестов создаёт window).
 * Возвращает функцию деинсталляции.
 */
export function installVirtualCadesPlugin(pki: VirtualGostPki): { plugin: Record<string, unknown>; created: Map<string, Record<string, unknown>>; uninstall(): void } {
  const { plugin, created } = createCadesPlugin(pki);
  const globalObj = globalThis as unknown as { window?: Record<string, unknown> };
  if (!globalObj.window) globalObj.window = {};
  (globalObj.window as Record<string, unknown>).cadesplugin = Promise.resolve(plugin);
  return {
    plugin,
    created,
    uninstall() {
      delete (globalObj.window as Record<string, unknown>).cadesplugin;
    },
  };
}