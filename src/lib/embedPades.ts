import { PDFDocument, PDFHexString, PDFName, PDFArray, PDFDict, PDFRef, PDFString } from 'pdf-lib';

export interface EmbedPAdESOptions {
  cmsBase64: string;
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

function hexToUint8Array(hex: string): Uint8Array {
  const cleanHex = hex.replace(/\s/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
}

function formatPdfDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `D:${year}${month}${day}${hours}${minutes}${seconds}`;
}

function pdfDateToString(date: Date): string {
  return formatPdfDate(date);
}

export async function createPAdESFromCMS(
  pdfBytes: Uint8Array,
  options: EmbedPAdESOptions
): Promise<Uint8Array> {
  const {
    cmsBase64,
    signerName,
    signingDate,
    reason = 'Подписано УКЭП',
    location = '',
    contactInfo = '',
    appearance = {},
  } = options;

  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const pageIndex = appearance.pageIndex ?? pages.length - 1;
  const page = pages[pageIndex];
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const rect = appearance.rect ?? [
    pageWidth - 220,
    20,
    pageWidth - 20,
    100,
  ];

  const cmsBytes = Uint8Array.from(atob(cmsBase64), c => c.charCodeAt(0));
  const cmsHex = uint8ArrayToHex(cmsBytes);

  const sigDict = pdfDoc.context.obj({
    Type: 'Sig',
    Filter: 'Adobe.PPKLite',
    SubFilter: 'adbe.pkcs7.detached',
    ByteRange: PDFArray.withContext(pdfDoc.context),
    Contents: PDFHexString.of('0'.repeat(16000)),
    Reason: reason ? PDFHexString.fromText(reason) : undefined,
    M: pdfDateToString(signingDate),
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

  const rawPdfBytes = await pdfDoc.save({ useObjectStreams: false });

  return injectCmsIntoPdf(rawPdfBytes, sigRef, cmsHex);
}

function injectCmsIntoPdf(
  pdfBytes: Uint8Array,
  sigRef: PDFRef,
  cmsHex: string
): Uint8Array {
  const pdfStr = new TextDecoder('latin1').decode(pdfBytes);

  const objMarker = `${sigRef.objectNumber} ${sigRef.generationNumber} obj`;
  const objStart = pdfStr.indexOf(objMarker);
  if (objStart === -1) {
    throw new Error('Signature object not found in PDF');
  }

  const objEndMarker = 'endobj';
  const objEnd = pdfStr.indexOf(objEndMarker, objStart);
  if (objEnd === -1) {
    throw new Error('Signature object end not found');
  }

  const objContent = pdfStr.slice(objStart, objEnd + objEndMarker.length);

  const contentsMatch = objContent.match(/<([0-9A-F]+)>/);
  if (!contentsMatch) {
    throw new Error('Contents placeholder not found');
  }
  const placeholder = contentsMatch[0];
  const placeholderHex = contentsMatch[1];

  const placeholderStartInObj = objContent.indexOf(placeholder);
  const contentsStartInPdf = objStart + placeholderStartInObj + 1;
  const contentsEndInPdf = contentsStartInPdf + placeholderHex.length;

  const beforeContents = pdfStr.slice(0, contentsStartInPdf);
  const afterContents = pdfStr.slice(contentsEndInPdf + 1);

  const newPdfStr = beforeContents + cmsHex + afterContents;

  const newPdfBytes = new TextEncoder().encode(newPdfStr);

  const newContentsStartInPdf = beforeContents.length + 1;
  const newContentsEndInPdf = newContentsStartInPdf + cmsHex.length - 1;

  const finalPdfStr = new TextDecoder('latin1').decode(newPdfBytes);

  const byteRange = `[0 ${newContentsStartInPdf} ${newContentsEndInPdf + 1} ${newPdfBytes.length - newContentsEndInPdf - 1}]`;

  const byteRangeRegex = /\[\s*0\s+\d+\s+\d+\s+\d+\s*\]/;
  const finalStr = finalPdfStr.replace(byteRangeRegex, byteRange);

  return new TextEncoder().encode(finalStr);
}

export async function createPAdESFromCMS_Alternative(
  pdfBytes: Uint8Array,
  options: EmbedPAdESOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  const cmsBytes = Uint8Array.from(atob(options.cmsBase64), c => c.charCodeAt(0));
  const cmsHex = uint8ArrayToHex(cmsBytes);
  const cmsHexLength = cmsHex.length;

  const placeholderHex = '0'.repeat(cmsHexLength + 100);
  const placeholderLength = placeholderHex.length;

  const sigDict = pdfDoc.context.obj({
    Type: 'Sig',
    Filter: 'Adobe.PPKLite',
    SubFilter: 'adbe.pkcs7.detached',
    ByteRange: PDFArray.withContext(pdfDoc.context),
    Contents: PDFHexString.of(placeholderHex),
    Reason: options.reason ? PDFHexString.fromText(options.reason) : undefined,
    M: formatPdfDate(options.signingDate),
    Name: PDFHexString.fromText(options.signerName),
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

  const pages = pdfDoc.getPages();
  const pageIndex = options.appearance?.pageIndex ?? pages.length - 1;
  const page = pages[pageIndex];
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const rect = options.appearance?.rect ?? [
    pageWidth - 220,
    20,
    pageWidth - 20,
    100,
  ];

  if (options.appearance?.showVisualSignature !== false) {
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

  const rawPdfBytes = await pdfDoc.save({ useObjectStreams: false });

  const pdfStr = new TextDecoder('latin1').decode(rawPdfBytes);

  const placeholder = `<${placeholderHex}>`;
  const placeholderPos = pdfStr.indexOf(placeholder);
  if (placeholderPos === -1) {
    throw new Error('Placeholder not found in PDF');
  }

  const contentsStart = placeholderPos + 1;
  const contentsEnd = contentsStart + placeholderHex.length - 1;

  const byteRange = `[0 ${contentsStart} ${contentsEnd + 1} ${rawPdfBytes.length - contentsEnd - 1}]`;

  let result = pdfStr.replace(placeholder, `<${cmsHex}>`);
  result = result.replace(/\[\s*0\s+\d+\s+\d+\s+\d+\s*\]/, byteRange);

  return new TextEncoder().encode(result);
}

export { uint8ArrayToHex, formatPdfDate };