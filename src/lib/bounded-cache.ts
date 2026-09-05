const MAX_ENTRIES = 500;

const lastSweep = new WeakMap<Map<unknown, { ts: number }>, number>();

export function boundedCacheSet<K, V extends { ts: number }>(
  cache: Map<K, V>,
  key: K,
  value: V,
  ttlMs: number
): void {
  const now = Date.now();

  // Ленивая зачистка протухших записей, не чаще раза в минуту на кеш.
  const last = lastSweep.get(cache) ?? 0;
  if (now - last > 60_000) {
    lastSweep.set(cache, now);
    for (const [k, v] of cache) {
      if (now - v.ts > ttlMs) cache.delete(k);
    }
  }

  if (cache.has(key)) {
    cache.delete(key);
  }
  cache.set(key, value);

  // Жёсткий предел размера: выселяем самые старые вставки (FIFO).
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}
