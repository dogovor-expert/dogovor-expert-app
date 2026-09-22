import { PDFDocument, PDFHexString, PDFName, PDFArray, PDFDict } from 'pdf-lib';

export interface EmbedPAdESOptions {
  cmsBase64?: string;
  signerName: string;
  signingDate: Date;
  reason?: string;
  location?: string;
  contactInfo?: string;
  appearance?: {
    pageIndex?: number;
    rect?: [number, number, number, number];
    showVisualSignature?: boolean;
  };
}

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function hexLengthOfCms(cmsBase64: string): number {
  const bytes = Uint8Array.from(atob(cmsBase64), c => c.charCodeAt(0));
  return uint8ArrayToHex(bytes).length;
}

function formatPdfDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `D:${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
}

/** Декодирует байты в строку как Latin-1 (обратная к latin1Encode).
 *  Явный раундтрип, чтобы не зависеть от браузерного TextDecoder и windows-1252. */
function latin1Decode(bytes: Uint8Array): string {
  let str = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    str += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk))
    );
  }
  return str;
}

function latin1Encode(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
  return bytes;
}

const padByteRangeValue = (n: number) => ' ' + String(n).padStart(10, '0'); // 11 символов

/**
 * Формирует плейсхолдер подписи PAdES (adbe.pkcs7.detached):
 *  - Sig-словарь с Contents-плейсхолдером из '0' длиной cmsHexLen;
 *  - ByteRange заполняется РЕАЛЬНЫМИ значениями (по позициям плейсхолдера Contents).
 * Возвращает:
 *  - placeholder: PDF с реальным ByteRange и пустым Contents (сюда потом вставляется CMS);
 *  - signedContent: байты [0, gap) ∪ [gap_end, end) — ИХ нужно подписать (CryptoPro, detached).
 */
export async function preparePAdESPlaceholder(
  rawPdfBytes: Uint8Array,
  cmsHexLen: number,
  options: EmbedPAdESOptions,
): Promise<{ placeholder: Uint8Array; signedContent: Uint8Array }> {
  const {
    signerName,
    signingDate,
    reason = 'Подписано УКЭП',
    location = '',
    contactInfo = '',
    appearance = {},
  } = options;

  const pdfDoc = await PDFDocument.load(rawPdfBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const pageIndex = appearance.pageIndex ?? pages.length - 1;
  const page = pages[pageIndex];
  const { width: pageWidth } = page.getSize();
  const rect = appearance.rect ?? [pageWidth - 220, 20, pageWidth - 20, 100];

  const placeholderHex = '0'.repeat(Math.max(2, cmsHexLen));

  const sigDict = pdfDoc.context.obj({
    Type: 'Sig',
    Filter: 'Adobe.PPKLite',
    SubFilter: 'adbe.pkcs7.detached',
    ByteRange: (() => {
      const br = PDFArray.withContext(pdfDoc.context);
      br.push(pdfDoc.context.obj(0));
      br.push(PDFName.of('**********'));
      br.push(PDFName.of('**********'));
      br.push(PDFName.of('**********'));
      return br;
    })(),
    Contents: PDFHexString.of(placeholderHex),
    Reason: reason ? PDFHexString.fromText(reason) : undefined,
    M: formatPdfDate(signingDate),
    Name: PDFHexString.fromText(signerName),
    Location: location ? PDFHexString.fromText(location) : undefined,
    ContactInfo: contactInfo ? PDFHexString.fromText(contactInfo) : undefined,
    Prop_Build: PDFHexString.fromText('dogovor.expert PAdES-BES'),
  });

  const sigRef = pdfDoc.context.register(sigDict);

  let acroForm = pdfDoc.catalog.lookupMaybe(PDFName.of('AcroForm'), PDFDict);
  if (!acroForm) {
    acroForm = pdfDoc.context.obj({
      Fields: PDFArray.withContext(pdfDoc.context),
      SigFlags: pdfDoc.context.obj(3),
    });
    pdfDoc.catalog.set(PDFName.of('AcroForm'), acroForm);
  }
  const fields = acroForm.lookupMaybe(PDFName.of('Fields'), PDFArray) ?? PDFArray.withContext(pdfDoc.context);
  fields.push(sigRef);
  acroForm.set(PDFName.of('Fields'), fields);
  acroForm.set(PDFName.of('SigFlags'), pdfDoc.context.obj(3));

  if (appearance.showVisualSignature !== false) {
    const widgetDict = pdfDoc.context.obj({
      Type: 'Annot',
      Subtype: 'Widget',
      FT: 'Sig',
      Rect: rect,
      V: sigRef,
      T: PDFHexString.fromText('UKEP_Signature'),
      F: 4,
      P: page.ref,
      H: 'P',
    });
    let annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (!annots) {
      annots = PDFArray.withContext(pdfDoc.context);
      page.node.set(PDFName.of('Annots'), annots);
    }
    annots.push(widgetDict);
  }

  const savedBytes = await pdfDoc.save({ useObjectStreams: false });
  const pdfStr = latin1Decode(savedBytes);

  const gapStart = pdfStr.indexOf(`<${placeholderHex}>`);
  if (gapStart === -1) throw new Error('Не удалось найти плейсхолдер Contents в PDF');
  const gapEnd = gapStart + placeholderHex.length + 2; // после '>'

  // Реальный ByteRange: [0, gapStart, gapEnd, total - gapEnd]
  const total = pdfStr.length;
  const L1 = gapStart;
  const L2 = gapEnd;
  const L3 = total - L2;

  let token = 0;
  const values = [L1, L2, L3];
  const placeholderStr = pdfStr.replace(/\/\*{10}/g, () => padByteRangeValue(values[token++]));
  if (token !== 3) throw new Error('Не удалось заменить ByteRange-плейсхолдеры');

  const placeholder = latin1Encode(placeholderStr);

  // Подписываемые байты: всё кроме Contents-пробела <...> (берём из самого плейсхолдера!)
  const signedContent = new Uint8Array(L1 + L3);
  signedContent.set(placeholder.subarray(0, L1), 0);
  signedContent.set(placeholder.subarray(L2, L2 + L3), L1);

  return { placeholder, signedContent };
}

/**
 * Вставляет готовый CMS (hex) в плейсхолдер на место нулевого Contents.
 *
 * КОНТРАКТ: длина cmsHex ДОЛЖНА точно совпадать с зарезервированным Contents.
 * Если вставить подпись короче, изменится длина файла и позиции ByteRange —
 * подпись станет невалидной. Поэтому плейсхолдер готовят под точную длину CMS
 * (см. пробный проход в SignDialog / UKEPSigner), а не «на глазок».
 */
export function embedCms(placeholder: Uint8Array, cmsHex: string): Uint8Array {
  const pdfStr = latin1Decode(placeholder);
  const needle = `<${'0'.repeat(cmsHex.length)}>`;
  const gapStart = pdfStr.indexOf(needle);
  if (gapStart === -1) {
    // Диагностика вместо невнятной ошибки: показываем фактический резерв.
    const reserved = /<0{16,}>/.exec(pdfStr);
    const reservedLen = reserved ? reserved[0].length - 2 : 0;
    throw new Error(
      `Длина CMS (${cmsHex.length} hex) не совпадает с зарезервированным Contents (${reservedLen} hex). ` +
        `Плейсхолдер нужно готовить под точную длину подписи (preparePAdESPlaceholder).`
    );
  }
  const gapEnd = gapStart + needle.length;

  const before = pdfStr.slice(0, gapStart);
  const after = pdfStr.slice(gapEnd);
  return latin1Encode(`${before}<${cmsHex}>${after}`);
}

/** Удобная обёртка: подписать контент и встроить CMS за один вызов (для тестов/не-CryptoPro). */
export async function createPAdESFromCMS(
  pdfBytes: Uint8Array,
  options: EmbedPAdESOptions,
): Promise<Uint8Array> {
  if (!options.cmsBase64) throw new Error('cmsBase64 обязателен для createPAdESFromCMS');
  const cmsHex = uint8ArrayToHex(Uint8Array.from(atob(options.cmsBase64), c => c.charCodeAt(0)));
  // Для корректной верификации подписывать нужно gap-удалённый контент; здесь предполагается,
  // что cmsBase64 уже получен именно над таким контентом. Используйте preparePAdESPlaceholder + embedCms.
  const { placeholder } = await preparePAdESPlaceholder(pdfBytes, cmsHex.length, options);
  return embedCms(placeholder, cmsHex);
}

export async function createPAdESFromCMS_Alternative(
  pdfBytes: Uint8Array,
  options: EmbedPAdESOptions,
): Promise<Uint8Array> {
  return createPAdESFromCMS(pdfBytes, options);
}

export { uint8ArrayToHex, hexLengthOfCms, formatPdfDate };
