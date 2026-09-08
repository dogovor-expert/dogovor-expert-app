/**
 * Автономный сквозной аудит УКЭП-контура (без сети и реального КриптоПро).
 * Запуск: npx tsx scripts/audit-ukep-full-cycle.mts
 *
 * 7 контрольных точек:
 *  1. Генерация PDF-договора (текст, реквизиты, синий визуальный штамп ЭЦП)
 *  2. preparePAdESPlaceholder (корректный /ByteRange + плейсхолдер Contents)
 *  3. Подписание через VirtualCadesPlugin + signPdfWithCryptoPro (addTimestamp: true)
 *  4. embedCms в PDF -> TEST_SIGNED_DOCUMENT.pdf
 *  5. verifyPAdESCrypto (valid, cryptoVerified, hashMatch, timestamp.present)
 *  6. Anti-Tamper (изменение 1 байта тела -> hashMatch: false, valid: false)
 *  7. Проверка отзыва сертификата (OCSP revoked через fetchImpl)
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as pkijs from "pkijs";
import * as asn1js from "asn1js";

import { preparePAdESPlaceholder, embedCms } from "../src/lib/embedPades";
import { signPdfWithCryptoPro } from "../src/lib/signCryptoPro";
import { verifyPAdESCrypto } from "../src/lib/pades-verify";
import { checkOcsp, _clearOcspCache } from "../src/lib/ocsp";
import { createVirtualGostPki, installVirtualCadesPlugin } from "../src/lib/__tests__/mocks/virtual-cadesplugin";

const ESTIMATED_CMS_HEX_LEN = 12000; // щедрый запас под CMS + TSA-штамп
const root = fileURLToPath(new URL("..", import.meta.url));
const outPdfPath = join(root, "TEST_SIGNED_DOCUMENT.pdf");

interface CheckPoint {
  n: number;
  name: string;
  pass: boolean;
  details: string;
}
const results: CheckPoint[] = [];
function report(n: number, name: string, pass: boolean, details: string) {
  results.push({ n, name, pass, details });
  console.log(`${pass ? "PASS" : "FAIL"} [${n}] ${name} — ${details}`);
}

// ---------- 1. PDF-договор ----------
async function makeContractPdf(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([595, 842]);
  page.drawText("CONTRACT No. 2026-09-001", { x: 60, y: 780, size: 16, font: bold });
  page.drawText("Supply agreement (dogovor) — UK E P full-cycle audit specimen", {
    x: 60, y: 755, size: 11, font,
  });
  page.drawText("Supplier: OOO Vitrina Dogovorov, INN 7700000000, OGRN 1157700000000", {
    x: 60, y: 725, size: 10, font,
  });
  page.drawText("Customer: OOO Pokupatel Dogovorov, INN 7800000000, OGRN 1157800000000", {
    x: 60, y: 708, size: 10, font,
  });
  page.drawText("Subject: template services under the dogovor.expert platform.", {
    x: 60, y: 691, size: 10, font,
  });
  page.drawText("Total: 120 000.00 RUB (VAT not applicable). Term: 30 banking days.", {
    x: 60, y: 674, size: 10, font,
  });
  page.drawText("Signed in the form of an enhanced qualified electronic signature (UK E P).", {
    x: 60, y: 657, size: 10, font,
  });
  // Синий визуальный штамп ЭЦП (виджет подписи будет наложен на эту зону)
  page.drawRectangle({
    x: 375, y: 20, width: 200, height: 80,
    color: rgb(0.05, 0.25, 0.65), opacity: 0.9,
  });
  page.drawText("ELECTRONIC SIGNATURE", { x: 385, y: 82, size: 9, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Dogovor.expert / GOST 34.10-2012", { x: 385, y: 68, size: 7, font, color: rgb(1, 1, 1) });
  page.drawText("CP CAdES BES + TSA timestamp", { x: 385, y: 56, size: 7, font, color: rgb(1, 1, 1) });
  return pdf.save({ useObjectStreams: false });
}

// ---------- 7. Фикстура OCSP revoked (рецепт ocsp-crl.test.ts) ----------
function buildOcspRevokedDer(serialHex: string): ArrayBuffer {
  const basic = new pkijs.BasicOCSPResponse();
  basic.tbsResponseData.responderID = new asn1js.OctetString({ valueHex: new Uint8Array([1, 2, 3]) });
  basic.tbsResponseData.producedAt = new Date();
  const certID = new pkijs.CertID();
  certID.hashAlgorithm = new pkijs.AlgorithmIdentifier({ algorithmId: "1.3.14.3.2.26" });
  (certID as unknown as { issuerNameHash: unknown }).issuerNameHash = new asn1js.OctetString({
    valueHex: new Uint8Array(20).fill(1),
  });
  (certID as unknown as { issuerKeyHash: unknown }).issuerKeyHash = new asn1js.OctetString({
    valueHex: new Uint8Array(20).fill(2),
  });
  (certID as unknown as { serialNumber: unknown }).serialNumber = new asn1js.Integer({
    valueHex: Uint8Array.from(Buffer.from(serialHex, "hex")),
  });
  const resp = new pkijs.SingleResponse({ certID });
  resp.certStatus = new asn1js.Constructed({
    idBlock: { tagClass: 3, tagNumber: 1 },
    value: [new asn1js.GeneralizedTime({ valueDate: new Date(Date.now() - 86_400_000) })],
  });
  resp.thisUpdate = new Date(Date.now() - 60_000);
  resp.nextUpdate = new Date(Date.now() + 300_000);
  basic.tbsResponseData.responses.push(resp);
  (basic.tbsResponseData as unknown as { tbsView: Uint8Array }).tbsView = new Uint8Array(
    basic.tbsResponseData.toSchema(true).toBER(false),
  );
  const basicRaw = basic.toSchema().toBER(false);
  const or = new pkijs.OCSPResponse({
    responseStatus: new asn1js.Enumerated({ value: 0 }),
    responseBytes: new pkijs.ResponseBytes({
      responseType: pkijs.id_PKIX_OCSP_Basic,
      response: new asn1js.OctetString({ valueHex: new Uint8Array(basicRaw) }),
    }),
  });
  return (or.toSchema as unknown as () => { toBER(): ArrayBuffer })().toBER(false);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// ---------- основной поток ----------
async function main() {
  console.log("=== УКЭП full-cycle audit (виртуальный стенд, без сети) ===\n");

  // PKI + плагин
  const pki = await createVirtualGostPki();
  const plugin = installVirtualCadesPlugin(pki);
  console.log(`Виртуальный сертификат: thumbprint=${pki.thumbprint}, DER=${pki.der.length} bytes\n`);

  // [1] PDF
  const rawPdf = await makeContractPdf();
  report(1, "Генерация PDF-договора", rawPdf.length > 500 && rawPdf[0] === 0x25, `${rawPdf.length} bytes, %PDF-заголовок=${String.fromCharCode(rawPdf[0], rawPdf[1], rawPdf[2], rawPdf[3], rawPdf[4])}`);

  // [2] Placeholder
  const { placeholder, signedContent } = await preparePAdESPlaceholder(rawPdf, ESTIMATED_CMS_HEX_LEN, {
    signerName: "Иванов Иван Иванович",
    signingDate: new Date(),
    reason: "Подписано УКЭП (audit full-cycle)",
    location: "Москва",
    appearance: { pageIndex: 0, rect: [375, 20, 575, 100], showVisualSignature: true },
  });
  const pdfStr = Buffer.from(placeholder).toString("latin1");
  const brOk = /\/ByteRange\s*\[\s*0\s+\d{10}\s+\d{10}\s+\d{10}\s*\]/.test(pdfStr);
  const contentsOk = pdfStr.includes(`<${"0".repeat(ESTIMATED_CMS_HEX_LEN)}>`);
  report(2, "preparePAdESPlaceholder (/ByteRange + Contents)", brOk && contentsOk, `ByteRange=${brOk}, Contents-плейсхолдер=${contentsOk}, placeholder=${placeholder.length} bytes, signedContent=${signedContent.length} bytes`);

  // [3] Подписание
  let cmsBase64: string;
  try {
    cmsBase64 = await signPdfWithCryptoPro(signedContent, pki.thumbprint, {
      addTimestamp: true,
      tsaUrl: "http://testca2012.cryptopro.ru/tsp/tsp.srf",
    });
  } finally {
    plugin.uninstall();
  }
  const cmsHex = toHex(Buffer.from(cmsBase64, "base64"));
  report(3, "Подписание VirtualCadesPlugin + signPdfWithCryptoPro(addTimestamp:true)", cmsHex.length > 0 && cmsHex.length <= ESTIMATED_CMS_HEX_LEN, `CMS=${Buffer.from(cmsBase64, "base64").length} bytes (hex ${cmsHex.length} / плейсхолдер ${ESTIMATED_CMS_HEX_LEN})`);

  // [4] embedCms -> файл
  const paddedHex = cmsHex + "0".repeat(ESTIMATED_CMS_HEX_LEN - cmsHex.length);
  const signedPdf = embedCms(placeholder, paddedHex);
  writeFileSync(outPdfPath, signedPdf);
  const savedHead = Buffer.from(signedPdf.slice(0, 5)).toString("latin1");
  report(4, "embedCms -> TEST_SIGNED_DOCUMENT.pdf", savedHead === "%PDF-" && signedPdf.length === placeholder.length, `${signedPdf.length} bytes (длина файла стабильна: ${signedPdf.length === placeholder.length}), путь: ${outPdfPath}`);

  // [5] Верификация
  const v = await verifyPAdESCrypto(signedPdf, signedContent, cmsHex);
  const ok5 = v.valid && v.cryptoVerified && v.integrity.hashMatch && v.timestamp.present === true;
  report(5, "verifyPAdESCrypto (valid + cryptoVerified + hashMatch + TSA)", ok5, `valid=${v.valid}, cryptoVerified=${v.cryptoVerified}, hashMatch=${v.integrity.hashMatch}, timestamp.present=${v.timestamp.present}, revocation=${v.revocation?.status ?? "-"}, errors=[${v.errors.join("; ")}], warnings=[${v.warnings.join("; ")}]`);

  // [6] Anti-Tamper: ровно 1 байт тела договора
  const tampered = Uint8Array.from(signedContent);
  tampered[100] = tampered[100] ^ 0x01;
  const vt = await verifyPAdESCrypto(signedPdf, tampered, cmsHex);
  const ok6 = !vt.valid && vt.integrity.hashMatch === false;
  report(6, "Anti-Tamper (1 байт -> hashMatch:false, valid:false)", ok6, `valid=${vt.valid}, hashMatch=${vt.integrity.hashMatch}, errors=[${vt.errors.join("; ")}]`);

  // [7] Отзыв сертификата (OCSP revoked через fetchImpl)
  _clearOcspCache();
  const cert = pkijs.Certificate.fromBER(pki.der.buffer.slice(pki.der.byteOffset, pki.der.byteOffset + pki.der.byteLength));
  const serialHex = toHex(
    (cert.serialNumber as unknown as { valueBlock: { valueHexView: Uint8Array } }).valueBlock.valueHexView,
  );
  const fetchImpl = (async () =>
    new Response(buildOcspRevokedDer(serialHex), { status: 200 })) as unknown as typeof fetch;
  const rev = await checkOcsp(cert, "http://ocsp.audit.local/ocsp", { fetchImpl, useCache: false });
  report(7, "Отзыв сертификата (OCSP revoked через fetchImpl)", rev.status === "revoked", `status=${rev.status}, method=${rev.method}, details=${rev.details ?? "-"}`);

  // Итог
  const passCount = results.filter((r) => r.pass).length;
  console.log("\n=== ИТОГОВАЯ ТАБЛИЦА ===");
  console.table(
    results.map((r) => ({ "#": r.n, "Контрольная точка": r.name, Результат: r.pass ? "PASS" : "FAIL", Детали: r.details })),
  );
  console.log(`Итог: ${passCount}/${results.length} PASS`);
  console.log(`Подписанный PDF: ${outPdfPath}`);
  if (passCount !== results.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error("AUDIT CRASH:", e);
  process.exitCode = 1;
});
