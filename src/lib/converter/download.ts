export function downloadBytes(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // M14: НЕ отзываем URL вручную (прежде был setTimeout 5с — мог оборвать
  // большую загрузку). Браузер сам освобождает blob-URL после скачивания.
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // M14: см. выше — ручной revokeObjectURL убран, чтобы не обрывать большие файлы.
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}

export function baseName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}
