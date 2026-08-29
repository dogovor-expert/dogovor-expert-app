import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { preparePAdESPlaceholder, embedCms, hexLengthOfCms } from '@/lib/embedPades';

function makeFakeCmsHex(length: number): string {
  const bytes = new Uint8Array(length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 37 + 11) & 0xff;
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function buildSamplePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  page.drawText('Test contract', { x: 50, y: 800, size: 12 });
  return doc.save();
}

const baseOpts = {
  signerName: 'Ivanov Ivan',
  signingDate: new Date('2026-01-15T10:00:00Z'),
  reason: 'Подписано УКЭП',
  appearance: { pageIndex: 0, showVisualSignature: true },
};

describe('PAdES placeholder + embed (correct signing math)', () => {
  it('встраивает CMS; ByteRange покрывает весь файл; подписанные байты == signedContent', async () => {
    const pdf = await buildSamplePdf();
    const cmsHex = makeFakeCmsHex(2048);

    const { placeholder, signedContent } = await preparePAdESPlaceholder(pdf, cmsHex.length, baseOpts);
    const signedPdf = embedCms(placeholder, cmsHex);

    // 1) Длина не меняется (плейсхолдер == CMS)
    expect(signedPdf.length).toBe(pdf.length === 0 ? pdf.length : placeholder.length);

    // 2) Репарсится pdf-lib
    const reparsed = await PDFDocument.load(signedPdf);
    expect(reparsed.getPages().length).toBe(1);

    // 3) Contents == cmsHex
    const text = new TextDecoder('latin1').decode(signedPdf);
    expect(text.indexOf(`<${cmsHex}>`)).toBeGreaterThan(-1);

    // 4) ByteRange покрывает весь файл: [0 L1 L2 L3]
    const m = text.match(/\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/);
    expect(m).not.toBeNull();
    const [, s0, s1, s2, s3] = m!.map(Number);
    expect(s0).toBe(0);
    expect(s1).toBeGreaterThan(0);
    expect(s2).toBe(s1 + (cmsHex.length + 2));
    // ByteRange [0, L1, L2, L3]: диапазоны [0,L1) и [L2, L2+L3); L2+L3 == длина файла
    expect(s2 + s3).toBe(signedPdf.length);
    expect(s1 + s3).toBe(signedPdf.length - (s2 - s1));

    // 5) Подписанные байты [0,s1) ∪ [s2,end) == signedContent
    const part1 = signedPdf.subarray(0, s1);
    const part2 = signedPdf.subarray(s2, s2 + s3);
    const combined = new Uint8Array(part1.length + part2.length);
    combined.set(part1, 0);
    combined.set(part2, part1.length);
    expect(Array.from(combined)).toEqual(Array.from(signedContent));
  });

  it('hexLengthOfCms корректно считает длину hex CMS', () => {
    const cms = btoa(String.fromCharCode(0x30, 0x82, 0x01, 0x00));
    expect(hexLengthOfCms(cms)).toBe(8);
  });

  it('разные длины CMS обрабатываются (плейсхолдер == cms)', async () => {
    const pdf = await buildSamplePdf();
    const cmsHex = makeFakeCmsHex(4096);
    const { placeholder } = await preparePAdESPlaceholder(pdf, cmsHex.length, baseOpts);
    const signed = embedCms(placeholder, cmsHex);
    expect(signed.length).toBe(placeholder.length);
    expect(new TextDecoder('latin1').decode(signed).indexOf(`<${cmsHex}>`)).toBeGreaterThan(-1);
  });
});
