// Зашифрованное хранение OAuth-токенов в vault (IndexedDB).
// Токены шифруются masterKey перед записью, поэтому даже при получении
// доступа к профилю браузера они нечитаемы.

import { idbGet, idbPut, idbDelete, idbGetAll, STORE } from "@/lib/vault/idb";
import { encryptJSON, decryptJSON, type Envelope } from "@/lib/vault/keyManager";
import type { CloudTokens, CloudProviderId } from "./types";

const TOKEN_PREFIX = "cloud_tokens_";

function tokenKey(providerId: CloudProviderId): string {
  return TOKEN_PREFIX + providerId;
}

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