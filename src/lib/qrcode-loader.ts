/**
 * Динамическая загрузка библиотеки qrcode для генерации QR-кодов.
 * Загружается только при генерации счёта с QR-кодом.
 */

export async function loadQrCode() {
  return await import('qrcode');
}