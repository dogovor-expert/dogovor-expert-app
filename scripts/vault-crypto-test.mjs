// Функциональный тест крипто-ядра vault (зеркало src/lib/vault/keyManager.ts v2).
// Запуск: node scripts/vault-crypto-test.mjs
// Схема «raw-bytes envelope»: без subtle.wrapKey, только importKey/encrypt/decrypt.

import { webcrypto as crypto } from "node:crypto";

const b64u = (bytes) => Buffer.from(bytes).toString("base64url");
const unb64u = (s) => new Uint8Array(Buffer.from(s, "base64url"));
const buf = (input) => {
  const a = new Uint8Array(input.byteLength);
  a.set(new Uint8Array(input.buffer ?? input));
  return a;
};
const enc = new TextEncoder();
const dec = new TextDecoder();
const random32 = () => crypto.getRandomValues(new Uint8Array(32));

let passed = 0, failed = 0;
function check(name, cond, extra = "") {
  if (cond) { passed++; console.log(`  OK   ${name}`); }
  else { failed++; console.log(`  FAIL ${name} ${extra}`); }
}

async function importAes(bytes, usages) {
  return crypto.subtle.importKey("raw", buf(bytes), { name: "AES-GCM" }, false, usages);
}
async function aesEncrypt(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, buf(plaintext));
  return { v: 2, iv: b64u(iv), ct: b64u(ct) };
}
async function aesDecrypt(key, w) {
  return buf(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64u(w.iv) }, key, unb64u(w.ct)));
}
async function deriveKek(pass, saltB64, iterations) {
  const base = await crypto.subtle.importKey("raw", buf(enc.encode(pass)), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: buf(unb64u(saltB64)), iterations, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}

async function main() {
  console.log("\n=== 1. Первый запуск: deviceSecret + masterSecret ===");
  const deviceSecret = random32();
  const masterSecret = random32();
  const deviceAes = await importAes(deviceSecret, ["encrypt", "decrypt"]);
  const wrapped = await aesEncrypt(deviceAes, masterSecret);
  check("masterSecret зашифрован device-ключом (v2)", wrapped.v === 2 && wrapped.ct.length > 0);

  console.log("\n=== 2. Тихая разблокировка после автолока (своё устройство) ===");
  let ms = await aesDecrypt(deviceAes, wrapped);
  check("masterSecret восстановлен без пароля", Buffer.compare(buf(ms), buf(masterSecret)) === 0);

  console.log("\n=== 3. Сессионный ключ non-extractable + шифрование записи ===");
  const sessionKey = await importAes(ms, ["encrypt", "decrypt"]);
  let extractLeak = false;
  try { await crypto.subtle.exportKey("raw", sessionKey); } catch { extractLeak = true; }
  check("session CryptoKey non-extractable", extractLeak);

  const docPayload = {
    values: { seller_passport: "4510 123456", seller_name: "Иванов Иван" },
    photos: { passport: ["data:image/png;base64,iVBORw0KGgo="] },
    esignSeller: "data:image/png;base64,sign...",
  };
  const envIv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: envIv }, sessionKey, buf(enc.encode(JSON.stringify(docPayload))));
  const envelope = { v: 1, iv: b64u(envIv), ct: b64u(ct) };
  check("запись зашифрована (Envelope v1)", !envelope.ct.includes("Иванов"));

  const pt = JSON.parse(dec.decode(await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unb64u(envelope.iv) }, sessionKey, unb64u(envelope.ct)
  )));
  check("round-trip расшифровка", pt.values.seller_name === "Иванов Иван" && Array.isArray(pt.photos.passport));

  console.log("\n=== 4. Целостность GCM: подмена ciphertext отклоняется ===");
  const tampered = unb64u(envelope.ct); tampered[5] ^= 0xff;
  let tamperRejected = false;
  try { await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64u(envelope.iv) }, sessionKey, tampered); }
  catch { tamperRejected = true; }
  check("tamper rejected", tamperRejected);

  console.log("\n=== 5. Passphrase: set → перенос на новое устройство → unlock ===");
  const passphrase = "Секретный-Пароль-2026!";
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const kek = await deriveKek(passphrase, b64u(salt), 600000);
  const passWrap = await aesEncrypt(kek, ms);
  const passRec = { ...passWrap, salt: b64u(salt), iterations: 600000 };
  check("masterSecret обёрнут passphrase", passRec.ct.length > 0);

  // «Новое устройство»: локального wrapped нет, есть пароль
  const restored = await aesDecrypt(kek, passRec);
  check("unlock по паролю", Buffer.compare(buf(restored), buf(masterSecret)) === 0);

  // Переоборачивание под новый deviceSecret
  const newDeviceSecret = random32();
  const newDeviceAes = await importAes(newDeviceSecret, ["encrypt", "decrypt"]);
  const rewrapped = await aesEncrypt(newDeviceAes, restored);
  const again = await aesDecrypt(newDeviceAes, rewrapped);
  const probeKey = await importAes(again, ["encrypt", "decrypt"]);
  const pIv = crypto.getRandomValues(new Uint8Array(12));
  const pCt = await crypto.subtle.encrypt({ name: "AES-GCM", iv: pIv }, probeKey, buf(enc.encode("probe")));
  const probeOut = dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: pIv }, probeKey, pCt));
  check("переоборачивание под новый deviceSecret работает", probeOut === "probe");

  console.log("\n=== 6. Неверный пароль → отказ ===");
  const wrongKek = await deriveKek("Не-Тот-Пароль", passRec.salt, 600000);
  let wrongRejected = false;
  try { await aesDecrypt(wrongKek, passRec); } catch { wrongRejected = true; }
  check("wrong passphrase rejected", wrongRejected);

  console.log("\n=== 7. Zero-knowledge share v2: ключ только в #fragment ===");
  const shareBytes = random32();
  const shareKey = await importAes(shareBytes, ["encrypt"]);
  const sIv = crypto.getRandomValues(new Uint8Array(12));
  const sCt = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: sIv }, shareKey,
    buf(enc.encode(JSON.stringify({ v: 2, values: { price: "500000" } })))
  );
  const d = `v2.${b64u(sIv)}.${b64u(sCt)}`;
  const k = b64u(shareBytes);
  check("d не содержит ключа и данных", !d.includes(k) && !d.includes("500000"));
  const decKey = await importAes(unb64u(k), ["decrypt"]);
  const sharePt = JSON.parse(dec.decode(await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unb64u(d.split(".")[1]) }, decKey, unb64u(d.split(".")[2])
  )));
  check("share decrypt via #fragment key", sharePt.values.price === "500000");

  console.log(`\n========== ИТОГО: ${passed} passed, ${failed} failed ==========`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error("CRASH:", e); process.exit(1); });