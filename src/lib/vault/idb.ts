// Минимальная promise-обёртка над IndexedDB без внешних зависимостей.
// Нам нужно хранить: CryptoKey (device-bound), зашифрованные записи документов
// и зашифрованные OAuth-токены облаков. IndexedDB умеет хранить CryptoKey
// (structured clone), поэтому non-extractable ключи переживают перезагрузку.

const DB_NAME = "dogovor-vault";
const DB_VERSION = 1;

export const STORE = {
  meta: "meta", // key-value: wrapped master key, passphrase-обёртки, флаги
  docs: "docs", // зашифрованные документы (ключ = id)
  tokens: "tokens", // зашифрованные OAuth-токены (ключ = providerId)
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openVaultDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB недоступен в этом окружении"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE.meta)) {
        db.createObjectStore(STORE.meta, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE.docs)) {
        db.createObjectStore(STORE.docs, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE.tokens)) {
        db.createObjectStore(STORE.tokens, { keyPath: "providerId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(
  db: IDBDatabase,
  store: string,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(store, mode).objectStore(store);
}

export async function idbGet<T>(
  store: string,
  key: IDBValidKey
): Promise<T | undefined> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, store, "readonly").get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function idbPut(store: string, value: unknown): Promise<void> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, store, "readwrite").put(value as any);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function idbDelete(
  store: string,
  key: IDBValidKey
): Promise<void> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, store, "readwrite").delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function idbGetAll<T>(store: string): Promise<T[]> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, store, "readonly").getAll();
    req.onsuccess = () => resolve((req.result as T[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export async function idbClear(store: string): Promise<void> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, store, "readwrite").clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Удобные хелперы для key-value meta-хранилища (deviceKey, masterKeyWrapped и т.п.)
export async function metaGet<T>(
  key: string
): Promise<T | undefined> {
  const rec = await idbGet<{ key: string; value: T }>(STORE.meta, key);
  return rec?.value;
}

export async function metaPut(key: string, value: unknown): Promise<void> {
  await idbPut(STORE.meta, { key, value });
}
