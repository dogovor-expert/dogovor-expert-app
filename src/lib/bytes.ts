/**
 * Преобразования между Uint8Array и base64/hex.
 *
 * Нейтральный модуль: без 'use client', поэтому его можно импортировать
 * и из клиентских компонентов, и из серверных route handlers.
 *
 * Ключевое ограничение: `String.fromCharCode.apply(null, Array.from(bytes))`
 * раскрывает массив в список аргументов и на размерах больше ~65–130 тыс.
 * элементов бросает `RangeError: Maximum call stack size exceeded`.
 * Типовой договор — 200 КБ–1 МБ, то есть как раз за этим пределом,
 * поэтому все преобразования здесь идут чанками.
 */

const CHUNK = 0x8000; // 32768 — заведомо ниже предела apply

/** Uint8Array → base64. Безопасно для файлов любого размера. */
export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + CHUNK))
    );
  }
  return btoa(binary);
}

/** base64 → Uint8Array. */
export function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** hex → Uint8Array (для /Contents подписи PDF). */
export function hexToUint8(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9A-Fa-f]/g, '');
  const bytes = new Uint8Array(clean.length >> 1);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}
