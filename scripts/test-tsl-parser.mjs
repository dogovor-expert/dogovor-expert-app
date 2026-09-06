import { promises as fs } from "node:fs";
import { parseTslXml, getRootCaCertificates, getAllValidCertificates } from "../src/lib/tsl-parser.js";

async function main() {
  const filePath = process.argv[2] || "C:\\Users\\alikpc\\Downloads\\сертификат\\tsl.xml";
  console.log(`Loading TSL from: ${filePath}`);

  const xml = await fs.readFile(filePath, "utf-8");
  console.log(`File size: ${(xml.length / 1024 / 1024).toFixed(2)} MB`);

  const startTime = Date.now();
  const tslData = await parseTslXml(xml, { verifySignature: false, source: "test" });
  const parseTime = Date.now() - startTime;

  console.log(`\n=== TSL Metadata ===`);
  console.log(`Version: ${tslData.metadata.version}`);
  console.log(`Date: ${tslData.metadata.date}`);
  console.log(`Scheme: ${tslData.metadata.schemeVersion}`);
  console.log(`Parse time: ${parseTime} ms`);

  console.log(`\n=== Statistics ===`);
  console.log(`Total CAs: ${tslData.authorities.length}`);
  const rootCerts = getRootCaCertificates(tslData);
  console.log(`Root certificates: ${rootCerts.length}`);
  const allValid = getAllValidCertificates(tslData);
  console.log(`All valid certificates: ${allValid.length}`);

  console.log(`\n=== Sample CAs (first 5) ===`);
  for (const ca of tslData.authorities.slice(0, 5)) {
    console.log(`- ${ca.name}`);
    console.log(`  Region: ${ca.region || "N/A"}`);
    console.log(`  INN: ${ca.inn || "N/A"}`);
    console.log(`  OGRN: ${ca.ogrn || "N/A"}`);
    console.log(`  Certificates: ${ca.certificates.length}`);
  }

  console.log(`\n=== Sample Root Certificates (first 3) ===`);
  for (const cert of rootCerts.slice(0, 3)) {
    console.log(`- Subject: ${cert.subjectDN}`);
    console.log(`  Valid: ${cert.notBefore.toISOString()} - ${cert.notAfter.toISOString()}`);
    console.log(`  Thumbprint: ${cert.thumbprint}`);
  }
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});