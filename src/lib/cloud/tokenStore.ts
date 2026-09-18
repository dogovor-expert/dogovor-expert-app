// Зашифрованное хранение OAuth-токенов в vault (IndexedDB).
// Токены шифруются masterKey перед записью, поэтому даже при получении
// доступа к профилю браузера они нечитаемы.

import { idbGet, idbPut, idbDelete, idbGetAll, STORE } from "@/lib/vault/idb";
import { encryptJSON, decryptJSON, type Envelope } from "@/lib/vault/keyManager";
import type { CloudTokens, CloudProviderId } from "./types";

export async function saveCloudTokens(tokens: CloudTokens): Promise<void> {
  const enc = await encryptJSON(tokens);
  await idbPut(STORE.tokens, { providerId: tokens.provider, enc });
}

export async function loadCloudTokens(
  providerId: CloudProviderId
): Promise<CloudTokens | null> {
  const rec = await idbGet<{ enc: Envelope; providerId: CloudProviderId }>(
    STORE.tokens,
    providerId
  );
  if (!rec) return null;
  return decryptJSON<CloudTokens>(rec.enc);
}

export async function deleteCloudTokens(
  providerId: CloudProviderId
): Promise<void> {
  await idbDelete(STORE.tokens, providerId);
}

export async function listConnectedProviders(): Promise<CloudProviderId[]> {
  const all = await idbGetAll<{ enc: Envelope; providerId: CloudProviderId }>(STORE.tokens);
  return all.map((r: { providerId: CloudProviderId }) => r.providerId);
}

/** Проверка валидности access_token (с запасом 60 сек) */
export function isTokenValid(tokens: CloudTokens | null): boolean {
  if (!tokens) return false;
  if (!tokens.expiresAt) return true; // нет срока — считаем валидным
  return Date.now() + 60_000 < tokens.expiresAt;
}

/** Обновление токенов провайдера через refresh_token. */
export async function refreshProviderTokens(providerId: CloudProviderId): Promise<CloudTokens | null> {
  const tokens = await loadCloudTokens(providerId);
  if (!tokens?.refreshToken) return null;

  let newTokens: CloudTokens | null = null;

  if (providerId === "yandex") {
    const { yandexDiskProvider } = await import("./providers/yandex");
    newTokens = await yandexDiskProvider.refreshTokens(tokens);
  } else if (providerId === "google") {
    const { googleDriveProvider } = await import("./providers/google");
    newTokens = await googleDriveProvider.refreshTokens(tokens);
  } else if (providerId === "dropbox") {
    const { dropboxProvider } = await import("./providers/dropbox");
    newTokens = await dropboxProvider.refreshTokens(tokens);
  }

  if (newTokens) {
    await saveCloudTokens(newTokens);
    return newTokens;
  }
  return null;
}