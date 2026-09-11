/**
 * 5.6 (аудит 2026-09): OWASP-подход к загрузке аватаров — 4 проверки:
 *  1) декларированный MIME в белом списке (быстрая отсечка в UI);
 *  2) размер ≤ 5 МБ;
 *  3) магические байты — НЕ доверяем MIME/расширению (этот модуль);
 *  4) ре-энкод через sharp на сервере (уничтожает полиглоты и EXIF-утечки).
 */

export type ImageKind = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

/** Белая список MIME, допускаемых к загрузке (aligned с detectImageKind). */
export const ALLOWED_AVATAR_MIME: readonly ImageKind[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

function ascii(buf: Uint8Array, offset: number, len: number): string {
  let s = "";
  for (let i = offset; i < offset + len && i < buf.length; i++) s += String.fromCharCode(buf[i]);
  return s;
}

/**
 * Определяет тип растра по сигнатуре. Возвращает null, если файл
 * не является изображением из белого списка (в т.ч. полиглоты с
 * «хвостом» другого формата в начале всё равно отсекает sharp-ре-энкод:
 * сюда доходят только валидные заголовки).
 */
export function detectImageKind(buf: Uint8Array): ImageKind | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return "image/png";
  // WEBP: "RIFF" <size> "WEBP"
  if (ascii(buf, 0, 4) === "RIFF" && ascii(buf, 8, 4) === "WEBP") return "image/webp";
  // AVIF/HEIF: <size32> "ftyp" major=avif|avis (или совместимый бренд в первые 64 байта)
  if (ascii(buf, 4, 4) === "ftyp") {
    const head = ascii(buf, 0, Math.min(64, buf.length));
    if (head.includes("avif") || head.includes("avis")) return "image/avif";
  }
  return null;
}

/** Максимальный размер исходного файла аватара (до ре-энкода). */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
