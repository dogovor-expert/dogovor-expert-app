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

  const base64 = btoa(String.fromCharCode(...pdfBytes));

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

  const signedData = await cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData');
  await signedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY);
  await signedData.propset_Content(base64);

  const encodingType = options.encodingType === 'binary'
    ? cadesplugin.CADESCOM_ENCODE_BINARY
    : cadesplugin.CADESCOM_ENCODE_BASE64;

  const detached = options.detached ?? false;

  const signature = await signedData.SignCades(
    signer,
    cadesplugin.CADESCOM_CADES_BES,
    detached,
    encodingType
  );

  return signature;
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