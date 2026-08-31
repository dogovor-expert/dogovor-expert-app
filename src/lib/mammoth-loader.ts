/**
 * Динамическая загрузка библиотеки mammoth для конвертации DOCX в HTML.
 * Загружается только при импорте DOCX-файлов.
 */

export async function loadMammoth() {
  return await import('mammoth');
}