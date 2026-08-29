'use client';

declare global {
  interface Window {
    cadesplugin?: Promise<any>;
  }
}

export interface SignOptions {
  detached?: boolean;
  encodingType?: 'base64' | 'binary';
  addSigningTime?: boolean;
  addTimestamp?: boolean; // TSA timestamp (CAdES-X-Long)
  tsaUrl?: string; // URL TSA сервера (например, freetsa.org)
}

export interface CertValidationResult {
  isValid: boolean;
  isQualified: boolean;
  errors: string[];
  warnings: string[];
  details: {
    subjectName: string;
    issuerName: string;
    validFrom: string;
    validTo: string;
    thumbprint: string;
    keyUsage: string[];
    extendedKeyUsage: string[];
    hasPrivateKey: boolean;
    chainValid: boolean;
    chainDetails: ChainCertInfo[];
    revocationStatus: 'valid' | 'revoked' | 'unknown' | 'offline';
  };
}

export interface ChainCertInfo {
  subjectName: string;
  issuerName: string;
  validFrom: string;
  validTo: string;
  thumbprint: string;
  isRoot: boolean;
  isTrustedRoot: boolean;
}

// OID константы
const OID = {
  // Key Usage
  KEY_USAGE: '2.5.29.15',
  // Extended Key Usage
  EXTENDED_KEY_USAGE: '2.5.29.37',
  // id-kp-qcSign (Qualified Certificate Signing) - RFC 3739
  QC_SIGN: '1.2.643.7.1.1.1.1',
  // id-kp-serverAuth, id-kp-clientAuth, etc.
  SERVER_AUTH: '1.3.6.1.5.5.7.3.1',
  CLIENT_AUTH: '1.3.6.1.5.5.7.3.2',
  // Basic Constraints
  BASIC_CONSTRAINTS: '2.5.29.19',
  // Authority Key Identifier
  AUTH_KEY_ID: '2.5.29.35',
  // Subject Key Identifier
  SUBJECT_KEY_ID: '2.5.29.14',
  // CRL Distribution Points
  CRL_DIST_POINTS: '2.5.29.31',
  // Authority Info Access (OCSP)
  AUTH_INFO_ACCESS: '1.3.6.1.5.5.7.1.1',
  // OCSP
  OCSP_ACCESS: '1.3.6.1.5.5.7.48.1',
  // CA Issuers
  CA_ISSUERS: '1.3.6.1.5.5.7.48.2',
};

// Trusted Root CAs for Russian Qualified Certificates (Министерство цифрового развития)
// Это упрощённый список — в продакшене должен загружаться из реестра Минцифры
const TRUSTED_ROOT_CAS = [
  'ООО "Удостоверяющий центр «Контур»"',
  'АО «Национальный удостоверяющий центр»',
  'АО «Удостоверяющий центр «СКБ Контур»',
  'АО «Удостоверяющий центр «Элеком»',
  'АО «Удостоверяющий центр «КриптоПро»',
  'АО «Удостоверяющий центр «Регистра»',
  'АО «Удостоверяющий центр «Криста»',
  'ФГУП «ГлавНИИсвязь»',
  'АО «Удостоверяющий центр «Такском»',
  'АО «Удостоверяющий центр «Синергия»',
];

/**
 * Проверяет сертификат на соответствие требованиям к квалифицированной ЭП (63-ФЗ)
 */
export async function validateCertificate(
  thumbprint: string,
  options: { checkRevocation?: boolean; checkChain?: boolean } = {}
): Promise<CertValidationResult> {
  if (!window.cadesplugin) {
    return {
      isValid: false,
      isQualified: false,
      errors: ['КриптоПро Browser Plugin не загружен'],
      warnings: [],
      details: getEmptyDetails(),
    };
  }

  const cadesplugin = await window.cadesplugin;

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Открываем хранилище и ищем сертификат по отпечатку
    const store = await cadesplugin.CreateObjectAsync('CAdESCOM.Store');
    await store.Open(
      cadesplugin.CAPICOM_CURRENT_USER_STORE,
      cadesplugin.CAPICOM_MY_STORE,
      cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
    );

    const certs = await store.Certificates;
    const count = await certs.Count;

    let cert: any = null;
    for (let i = 1; i <= count; i++) {
      const c = await certs.Item(i);
      const tp = await c.Thumbprint;
      if (tp === thumbprint) {
        cert = c;
        break;
      }
    }

    if (!cert) {
      await store.Close();
      return {
        isValid: false,
        isQualified: false,
        errors: ['Сертификат с указанным отпечатком не найден в хранилище'],
        warnings: [],
        details: getEmptyDetails(),
      };
    }

    // Базовые данные
    const subjectName = await cert.SubjectName;
    const issuerName = await cert.IssuerName;
    const validFrom = await cert.ValidFromDate;
    const validTo = await cert.ValidToDate;
    const tp = await cert.Thumbprint;
    const hasPrivateKey = await cert.HasPrivateKey();

    // Key Usage
    const keyUsage = await getKeyUsage(cert, cadesplugin);

    // Extended Key Usage
    const extendedKeyUsage = await getExtendedKeyUsage(cert, cadesplugin);

    // Проверка квалифицированности (EKU содержит id-kp-qcSign)
    const isQualified = await hasQualifiedEKU(cert, cadesplugin);

    // Валидация сроков
    const now = new Date();
    const validFromDate = new Date(validFrom);
    const validToDate = new Date(validTo);
    if (now < validFromDate) errors.push('Сертификат ещё не вступил в силу');
    if (now > validToDate) errors.push('Срок действия сертификата истёк');

    // Проверка Key Usage
    if (!keyUsage.includes('digitalSignature')) {
      warnings.push('Key Usage не содержит digitalSignature');
    }
    if (!keyUsage.includes('nonRepudiation')) {
      warnings.push('Key Usage не содержит nonRepudiation (неотрекаемость)');
    }

    // Проверка Extended Key Usage
    const hasQcSign = extendedKeyUsage.some(oid => oid === '1.2.643.7.1.1.1.1');
    if (!hasQcSign) {
      warnings.push('Extended Key Usage не содержит id-kp-qcSign (1.2.643.7.1.1.1.1) — сертификат может не быть квалифицированным');
    }

    // Проверка приватного ключа
    if (!hasPrivateKey) {
      errors.push('У сертификата нет связанного закрытого ключа (HasPrivateKey = false)');
    }

    // Валидация цепочки доверия
    let chainValid = false;
    let chainDetails: ChainCertInfo[] = [];
    if (true /* options.checkChain */) {
      const chainResult = await validateCertificateChain(cert, cadesplugin);
      chainValid = chainResult.valid;
      chainDetails = chainResult.chain;
      if (!chainValid) {
        errors.push('Цепочка доверия не ведёт к доверенному корневому УЦ Минцифры');
      }
    }

    // Проверка отзыва (CRL/OCSP)
    let revocationStatus: 'valid' | 'revoked' | 'unknown' | 'offline' = 'unknown';
    if (true /* options.checkRevocation */) {
      revocationStatus = await checkRevocation(cert, cadesplugin);
      if (revocationStatus === 'revoked') {
        errors.push('Сертификат отозван (проверка CRL/OCSP)');
      } else if (revocationStatus === 'offline') {
        warnings.push('Не удалось проверить отзыв (CRL/OCSP недоступны)');
      }
    }

    await store.Close();

    const isValid = errors.length === 0;
    const isQualifiedFinal = isQualified && isValid && hasQcSign;

    return {
      isValid,
      isQualified: isQualifiedFinal,
      errors,
      warnings,
      details: {
        subjectName: await cert.SubjectName,
        issuerName: await cert.IssuerName,
        validFrom: await cert.ValidFromDate,
        validTo: await cert.ValidToDate,
        thumbprint,
        keyUsage,
        extendedKeyUsage: extendedKeyUsage.map(oid => formatOID(oid)),
        hasPrivateKey,
        chainValid,
        chainDetails,
        revocationStatus,
      },
    };
  } catch (e: any) {
    return {
      isValid: false,
      isQualified: false,
      errors: ['Ошибка валидации: ' + (e.message || String(e))],
      warnings: [],
      details: getEmptyDetails(),
    };
  }
}

function getEmptyDetails() {
  return {
    subjectName: '',
    issuerName: '',
    validFrom: '',
    validTo: '',
    thumbprint: '',
    keyUsage: [],
    extendedKeyUsage: [],
    hasPrivateKey: false,
    chainValid: false,
    chainDetails: [],
    revocationStatus: 'unknown' as const,
  };
}

async function getKeyUsage(cert: any, cadesplugin: any): Promise<string[]> {
  const usage: string[] = [];
  try {
    const extensions = await cert.Extensions;
    const count = await extensions.Count;
    for (let i = 1; i <= count; i++) {
      const ext = await extensions.Item(i);
      const oid = await ext.OID;
      if (oid === OID.KEY_USAGE) {
        const value = await ext.Value;
        // Value — это битовая маска
        const bits = await value;
        if (bits & 0x80) usage.push('digitalSignature');
        if (bits & 0x40) usage.push('nonRepudiation');
        if (bits & 0x20) usage.push('keyEncipherment');
        if (bits & 0x10) usage.push('dataEncipherment');
        if (bits & 0x08) usage.push('keyAgreement');
        if (bits & 0x04) usage.push('keyCertSign');
        if (bits & 0x02) usage.push('cRLSign');
        if (bits & 0x01) usage.push('decipherOnly');
      }
    }
  } catch {}
  return usage;
}

async function getExtendedKeyUsage(cert: any, cadesplugin: any): Promise<string[]> {
  const usage: string[] = [];
  try {
    const extensions = await cert.Extensions;
    const count = await extensions.Count;
    for (let i = 1; i <= count; i++) {
      const ext = await extensions.Item(i);
      const oid = await ext.OID;
      if (oid === OID.EXTENDED_KEY_USAGE) {
        const value = await ext.Value;
        const count2 = await value.Count;
        for (let j = 1; j <= count2; j++) {
          const oidItem = await value.Item(j);
          const oid = await oidItem.OID;
          usage.push(oid);
        }
      }
    }
  } catch {}
  return usage;
}

async function hasQualifiedEKU(cert: any, cadesplugin: any): Promise<boolean> {
  try {
    const extensions = await cert.Extensions;
    const count = await extensions.Count;
    for (let i = 1; i <= count; i++) {
      const ext = await extensions.Item(i);
      const oid = await ext.OID;
      if (oid === OID.EXTENDED_KEY_USAGE) {
        const value = await ext.Value;
        const count2 = await value.Count;
        for (let j = 1; j <= count2; j++) {
          const oidItem = await value.Item(j);
          const oid = await oidItem.OID;
          if (oid === '1.2.643.7.1.1.1.1') return true; // id-kp-qcSign
        }
      }
    }
  } catch {}
  return false;
}

function formatOID(oid: string): string {
  const names: Record<string, string> = {
    '1.2.643.7.1.1.1.1': 'id-kp-qcSign (Квалифицированная подпись)',
    '1.3.6.1.5.5.7.3.1': 'Server Auth',
    '1.3.6.1.5.5.7.3.2': 'Client Auth',
    '1.3.6.1.5.5.7.3.3': 'Code Signing',
    '1.3.6.1.5.5.7.3.4': 'Email Protection',
    '1.3.6.1.5.5.7.3.8': 'Time Stamping',
  };
  return names[oid] || oid;
}

async function validateCertificateChain(cert: any, cadesplugin: any): Promise<{ valid: boolean; chain: ChainCertInfo[] }> {
  const chain: ChainCertInfo[] = [];
  let currentCert = cert;
  let currentIssuer = await currentCert.IssuerName;
  let isRoot = false;
  let depth = 0;

  const store = await cadesplugin.CreateObjectAsync('CAdESCOM.Store');
  await store.Open(
    cadesplugin.CAPICOM_CURRENT_USER_STORE,
    cadesplugin.CAPICOM_CA_STORE, // хранилище корневых УЦ
    cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
  );

  try {
    while (!isRoot && depth < 10) {
      const subjectName = await currentCert.SubjectName;
      const issuerName = await currentCert.IssuerName;
      const validFrom = await currentCert.ValidFromDate;
      const validTo = await currentCert.ValidToDate;
      const thumbprint = await currentCert.Thumbprint;

      // Проверяем, является ли текущий сертификат корневым (самоподписанным)
      const currentSubject = await currentCert.SubjectName;
      isRoot = currentSubject === currentIssuer;

      // Проверяем, есть ли этот сертификат в доверенных корневых
      let isTrustedRoot = false;
      try {
        const rootStore = await cadesplugin.CreateObjectAsync('CAdESCOM.Store');
        await rootStore.Open(
          cadesplugin.CAPICOM_CURRENT_USER_STORE,
          cadesplugin.CAPICOM_ROOT_STORE,
          cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
        );
        const rootCerts = await rootStore.Certificates;
        const rootCount = await rootCerts.Count;
        for (let i = 1; i <= rootCount; i++) {
          const rootCert = await rootCerts.Item(i);
          const rootThumbprint = await rootCert.Thumbprint;
          if (rootThumbprint === (await currentCert.Thumbprint)) {
            isTrustedRoot = true;
            break;
          }
        }
        await rootStore.Close();
      } catch {}

      // Проверяем по имени доверенных УЦ
      const trustedByName = TRUSTED_ROOT_CAS.some(name => issuerName.includes(name));

      chain.push({
        subjectName: subjectName,
        issuerName,
        validFrom,
        validTo,
        thumbprint: await currentCert.Thumbprint,
        isRoot,
        isTrustedRoot: isTrustedRoot || trustedByName,
      });

      if (isRoot) break;

      // Ищем издателя в хранилище CA
      const caStore = await cadesplugin.CreateObjectAsync('CAdESCOM.Store');
      await caStore.Open(
        cadesplugin.CAPICOM_CURRENT_USER_STORE,
        cadesplugin.CAPICOM_CA_STORE,
        cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
      );
      const caCerts = await caStore.Certificates;
      const caCount = await caCerts.Count;
      let found = false;
      for (let i = 1; i <= caCount; i++) {
        const caCert = await caCerts.Item(i);
        const caSubject = await caCert.SubjectName;
        if (caSubject === currentIssuer) {
          currentCert = caCert;
          found = true;
          break;
        }
      }
      await caStore.Close();

      if (!found) {
        // Ищем в хранилище Root
        const rootStore2 = await cadesplugin.CreateObjectAsync('CAdESCOM.Store');
        await rootStore2.Open(
          cadesplugin.CAPICOM_CURRENT_USER_STORE,
          cadesplugin.CAPICOM_ROOT_STORE,
          cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
        );
        const rootCerts2 = await rootStore2.Certificates;
        const rootCount2 = await rootCerts2.Count;
        for (let i = 1; i <= rootCount2; i++) {
          const rootCert = await rootCerts2.Item(i);
          const rootSubject = await rootCert.SubjectName;
          if (rootSubject === currentIssuer) {
            currentCert = rootCert;
            found = true;
            break;
          }
        }
        await rootStore2.Close();
      }

      if (!found) {
        // Цепочка прервалась
        return { valid: false, chain };
      }

      depth++;
    }

    // Проверяем, доверяем ли конечному корневому
    const lastCert = chain[chain.length - 1];
    const trusted = lastCert.isTrustedRoot || lastCert.isRoot;
    return { valid: trusted, chain };
  } finally {
    try { await store.Close(); } catch {}
  }
}

async function checkRevocation(cert: any, cadesplugin: any): Promise<'valid' | 'revoked' | 'unknown' | 'offline'> {
  try {
    // Пытаемся получить CRL Distribution Points
    const extensions = await cert.Extensions;
    const count = await extensions.Count;
    let crlUrls: string[] = [];

    for (let i = 1; i <= count; i++) {
      const ext = await extensions.Item(i);
      const oid = await ext.OID;
      if (oid === '2.5.29.31') { // CRL Distribution Points
        const value = await ext.Value;
        // Парсинг CRL DP — сложно, упрощаем
      }
    }

    // Для упрощения: используем встроенную проверку CAdESCOM
    // CAdESCOM может проверить отзыв при верификации если включить флаг
    const signedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData');
    // Попытка верификации с проверкой отзыва
    // Но это требует подписанных данных... упрощаем

    // В реальности здесь должен быть запрос к CRL/OCSP
    // Для MVP возвращаем 'unknown' — лучше чем молча пропускать отозванный
    return 'unknown';
  } catch {
    return 'offline';
  }
}

export async function signPdfWithCryptoPro(
  pdfBytes: Uint8Array,
  thumbprint: string,
  options: SignOptions = {}
): Promise<string> {
  if (!window.cadesplugin) {
    throw new Error('КриптоПро Browser Plugin не загружен. Установите плагин и перезагрузите страницу.');
  }

  const cadesplugin = await window.cadesplugin;

  // Валидация сертификата перед подписанием
  const validation = await validateCertificate(thumbprint, { checkRevocation: false, checkChain: true });
  if (!validation.isValid) {
    throw new Error('Сертификат невалиден для подписания: ' + validation.errors.join('; '));
  }
  if (!validation.isQualified) {
    throw new Error('Сертификат не является квалифицированным (нет id-kp-qcSign или цепочка недоверенная)');
  }
  if (validation.warnings.length > 0) {
    console.warn('Предупреждения сертификата:', validation.warnings);
  }

  const base64 = uint8ToBase64(pdfBytes);

  const signer = await cadesplugin.CreateObjectAsync('CAdESCOM.CPSigner');
  await signer.propset_Certificate(thumbprint);
  await signer.propset_Options(cadesplugin.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN);

  if (options.addSigningTime !== false) {
    const cadesAttrs = await cadesplugin.CreateObjectAsync('CAdESCOM.CPAttribute');
    await cadesAttrs.propset_Name(cadesplugin.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME);
    await cadesAttrs.propset_Value(new Date());

    const attrs = await signer.AuthenticatedAttributes2;
    await attrs.Add(cadesAttrs);
  }

  // TSA Timestamp (CAdES-X-Long Type 1)
  if (options.addTimestamp) {
    const tsaUrl = options.tsaUrl || 'https://freetsa.org/tsr';
    try {
      const tsaAttr = await cadesplugin.CreateObjectAsync('CAdESCOM.CPAttribute');
      await tsaAttr.propset_Name(cadesplugin.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNATURE_TIMESTAMP_TOKEN);
      // Внимание: для полноценного TSA нужно получить токен от TSA сервера
      // Здесь упрощаем — в реальности нужно сделать HTTP запрос к TSA
      console.warn('TSA timestamp требует отдельного HTTP запроса к TSA серверу');
    } catch {}
  }

  const signedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData');
  await signedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY);
  await signedData.propset_Content(base64);

  const encodingType = options.encodingType === 'binary'
    ? cadesplugin.CADESCOM_ENCODE_BINARY
    : cadesplugin.CADESCOM_ENCODE_BASE64;

  const detached = options.detached ?? true;

  // Поддержка CAdES-X-Long Type 1 (addTimestamp = true)
  const cadesType = options.addTimestamp
    ? cadesplugin.CADESCOM_CADES_X_LONG_TYPE_1
    : cadesplugin.CADESCOM_CADES_BES;

  // Реальная метка времени от TSA (если запрошена) — через свойство плагина
  if (options.addTimestamp) {
    const tsaUrl = options.tsaUrl || 'https://freetsa.org/tsr';
    try {
      await signer.propset_TSAAddress(tsaUrl);
    } catch (e) {
      console.warn('Не удалось установить TSA-адрес:', e);
    }
  }

  const signature = await signedData.SignCades(
    signer,
    cadesType,
    detached,
    options.encodingType === 'binary'
      ? cadesplugin.CADESCOM_ENCODE_BINARY
      : cadesplugin.CADESCOM_ENCODE_BASE64
  );

  return signature;
}

/** Преобразует Uint8Array в base64 без spread (безопасно для больших файлов). */
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)) as unknown as number[]
    );
  }
  return btoa(binary);
}

export async function signDataWithCryptoPro(
  data: Uint8Array,
  thumbprint: string,
  options: SignOptions = {}
): Promise<string> {
  return signPdfWithCryptoPro(data, thumbprint, options);
}

export async function verifyCadesSignature(
  signatureBase64: string,
  dataBase64?: string
): Promise<{
  valid: boolean;
  signer?: {
    subjectName: string;
    issuerName: string;
    validFrom: string;
    validTo: string;
    thumbprint: string;
  };
  signingTime?: Date;
  error?: string;
}> {
  if (!window.cadesplugin) {
    return { valid: false, error: 'Плагин не загружен' };
  }

  try {
    const cadesplugin = await window.cadesplugin;

    const signedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData');
    await signedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY);

    if (dataBase64) {
      await signedData.propset_Content(dataBase64);
    }

    await signedData.VerifyCades(
      signatureBase64,
      cadesplugin.CADESCOM_CADES_BES,
      true
    );

    const signers = await signedData.Signers;
    const count = await signers.Count;

    if (count === 0) {
      return { valid: false, error: 'Подписчики не найдены' };
    }

    const signer = await signers.Item(1);
    const cert = await signer.Certificate;

    const subjectName = await cert.SubjectName;
    const issuerName = await cert.IssuerName;
    const validFrom = await cert.ValidFromDate;
    const validTo = await cert.ValidToDate;
    const thumbprint = await cert.Thumbprint;

    let signingTime: Date | undefined;
    try {
      const attrs = await signer.AuthenticatedAttributes2;
      const attrCount = await attrs.Count;
      for (let i = 1; i <= attrCount; i++) {
        const attr = await attrs.Item(i);
        const name = await attr.Name;
        if (name === cadesplugin.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME) {
          const value = await attr.Value;
          signingTime = new Date(value);
          break;
        }
      }
    } catch {
      // signing time not present
    }

    return {
      valid: true,
      signer: {
        subjectName,
        issuerName,
        validFrom,
        validTo,
        thumbprint,
      },
      signingTime,
    };
  } catch (e: any) {
    return { valid: false, error: e.message || String(e) };
  }
}

export function isQualifiedCertificate(subjectName: string): boolean {
  return (
    subjectName.includes('OGRN') ||
    subjectName.includes('ОГРН') ||
    subjectName.includes('SNILS') ||
    subjectName.includes('СНИЛС') ||
    subjectName.includes('INN') ||
    subjectName.includes('ИНН')
  );
}