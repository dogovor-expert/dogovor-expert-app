// Конфигурация TSA (Time Stamping Authority) для CAdES-X-Long Type 1.
// Источник истины — здесь. Подписи и проверки берут URL через getDefaultTsaUrl().

export const TSA_PRESETS = {
  // Тестовый TSP КриптоПро (RFC 3161, ГОСТ)
  cryptopro_test: "http://testca2012.cryptopro.ru/tsp/tsp.srf",
  // Промышленный TSP КриптоПро
  cryptopro_prod: "http://tsp.cryptopro.ru/tsp/tsp.srf",
  // freetsa.org (RFC 3161, SHA-256, fallback если ГОСТ-TSA недоступен)
  freetsa: "https://freetsa.org/tsr",
} as const;

export const DEFAULT_TSA_URLS: ReadonlyArray<string> = [
  TSA_PRESETS.cryptopro_prod,
  TSA_PRESETS.cryptopro_test,
  TSA_PRESETS.freetsa,
];

// Резолв дефолтного URL с приоритетом:
//  1) явный аргумент (например, из настроек админа),
//  2) NEXT_PUBLIC_DEFAULT_TSA_URL,
//  3) первый URL из DEFAULT_TSA_URLS (КриптоПро prod).
export function resolveTsaUrl(explicit?: string): string {
  if (explicit && explicit.trim().length > 0) return explicit.trim();
  const fromEnv =
    typeof process !== "undefined" && process.env
      ? process.env.NEXT_PUBLIC_DEFAULT_TSA_URL
      : undefined;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim();
  return DEFAULT_TSA_URLS[0];
}
