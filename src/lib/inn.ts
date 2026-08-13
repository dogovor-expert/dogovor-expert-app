export function isValidInn(value: string): boolean {
  const inn = value.trim();
  if (inn === "") return true;
  if (!/^\d{10}$/.test(inn) && !/^\d{12}$/.test(inn)) return false;
  const d = inn.split("").map(Number);
  const check = (weights: number[], offset: number) => {
    const sum = weights.reduce((acc, w, i) => acc + w * d[i], 0);
    return (sum % 11) % 10 === d[offset];
  };
  if (d.length === 10) {
    return check([2, 4, 10, 3, 5, 9, 4, 6, 8], 9);
  }
  return (
    check([7, 2, 4, 10, 3, 5, 9, 4, 6, 8], 10) &&
    check([3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8], 11)
  );
}

export function formatInn(value: string): string {
  return value.replace(/\D/g, "").slice(0, 12);
}