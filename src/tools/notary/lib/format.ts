export const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatRelative = (iso: string, now = new Date()): string => {
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} дн назад`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} нед назад`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} мес назад`;
  const years = Math.round(days / 365);
  return `${years} г назад`;
};

export const shortenHash = (hash: string, prefix = 8, suffix = 6): string => {
  if (hash.length <= prefix + suffix + 1) return hash;
  return `${hash.slice(0, prefix)}…${hash.slice(-suffix)}`;
};

// Numeric formatting for the sidebar counters.
export const formatCount = (value: number): string => {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(value < 10_000 ? 1 : 0).replace(".", ",")}k`;
  return `${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
};
