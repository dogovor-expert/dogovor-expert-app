import {
  scryptSync,
  randomBytes as nodeRandomBytes,
  timingSafeEqual,
  createHash,
} from "node:crypto";

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;

/**
 * Хеширование пароля через scrypt (Node.js native crypto).
 * Формат хранения: scrypt:<salt base64>:<key base64>
 * Только для server-кода (API-роуты). Клиентская часть в src/lib/crypto.ts.
 */
export function hashPassword(password: string): string {
  const salt = nodeRandomBytes(SALT_LENGTH);
  const key = scryptSync(password, salt, KEY_LENGTH, {
    cost: SCRYPT_COST,
    blockSize: SCRYPT_BLOCK_SIZE,
    parallelization: SCRYPT_PARALLELIZATION,
  });
  return `scrypt:${salt.toString("base64")}:${key.toString("base64")}`;
}

/**
 * Проверка пароля. timingSafeEqual предотвращает timing attack.
 */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const salt = Buffer.from(parts[1], "base64");
  const storedKey = Buffer.from(parts[2], "base64");
  const key = scryptSync(password, salt, storedKey.length, {
    cost: SCRYPT_COST,
    blockSize: SCRYPT_BLOCK_SIZE,
    parallelization: SCRYPT_PARALLELIZATION,
  });
  return timingSafeEqual(key, storedKey);
}

/**
 * SHA-256 хеш для высокоэнтропийных токенов доступа (unlock-сессий).
 * scrypt не нужен: токен генерируется randomUUID (122 бита энтропии),
 * поэтому SHA-256 достаточно и быстрее на каждый запрос.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}