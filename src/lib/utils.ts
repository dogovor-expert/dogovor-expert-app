export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatNumber(n: number): string {
  return n.toLocaleString("ru-RU");
}

export function validateInn(inn: string): boolean {
  const clean = inn.replace(/\D/g, "");
  if (clean.length !== 10 && clean.length !== 12) return false;

  const checksum = (digits: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += Number(digits[i]) * weights[i];
    }
    return (sum % 11) % 10;
  };

  if (clean.length === 10) {
    return checksum(clean, [2, 4, 10, 3, 5, 9, 4, 6, 8]) === Number(clean[9]);
  }
  return (
    checksum(clean.slice(0, 10), [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === Number(clean[10]) &&
    checksum(clean.slice(0, 11), [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === Number(clean[11])
  );
}