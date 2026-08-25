// Менеджер облаков: реестр провайдеров, конфигурация, подключение/отключение,
// экспорт документов. Читает client_id из env (NEXT_PUBLIC_*) и из localStorage
// (пользовательские настройки), приоритет — localStorage.

import type {
  CloudProvider,
  CloudTokens,
  CloudConfig,
  CloudProviderId,
} from "./types";
import { yandexDiskProvider } from "./providers/yandex";
import { googleDriveProvider } from "./providers/google";
import { dropboxProvider } from "./providers/dropbox";
import {
  saveCloudTokens,
  loadCloudTokens,
  deleteCloudTokens,
  listConnectedProviders,
  isTokenValid,
} from "./tokenStore";
import { openAuthPopup, parseTokenFromFragment } from "./oauth";

const PROVIDERS: Record<CloudProviderId, CloudProvider> = {
  yandex: yandexDiskProvider,
  google: googleDriveProvider,
  dropbox: dropboxProvider,
};

const CONFIG_KEY = "cloud_config_v1";

interface StoredConfig {
  yandex?: { clientId: string };
  google?: { clientId: string };
  dropbox?: { clientId: string };
}

function getEnvClientId(provider: CloudProviderId): string | undefined {
  switch (provider) {
    case "yandex":
      return process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID;
    case "google":
      return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    case "dropbox":
      return process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID;
  }
}

function loadStoredConfig(): StoredConfig {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredConfig(cfg: StoredConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}

export function getProvider(id: CloudProviderId): CloudProvider {
  return PROVIDERS[id];
}

export function getAllProviders(): CloudProvider[] {
  return Object.values(PROVIDERS);
}

export function getConfig(provider: CloudProviderId): CloudConfig {
  const stored = loadStoredConfig();
  const envId = getEnvClientId(provider);
  const clientId = stored[provider]?.clientId || envId || "";
  const providerObj = PROVIDERS[provider];
  return {
    clientId,
    redirectUri: providerObj.getRedirectUri(),
    scopes: [], // провайдеры используют дефолтные
  };
}

export function setClientId(provider: CloudProviderId, clientId: string): void {
  const cfg = loadStoredConfig();
  cfg[provider] = { ...cfg[provider], clientId };
  saveStoredConfig(cfg);
}

export function getClientId(provider: CloudProviderId): string {
  return getConfig(provider).clientId;
}

/** Запускает OAuth и сохраняет токены в vault. */
export async function connectProvider(
  providerId: CloudProviderId
): Promise<{ tokens: CloudTokens; userInfo: { name?: string; email?: string } }> {
  const provider = getProvider(providerId);
  const config = getConfig(providerId);

  if (!config.clientId) {
    throw new Error(
      `Client ID не задан для ${provider.name}. Добавьте в настройках или через env NEXT_PUBLIC_${providerId.toUpperCase()}_CLIENT_ID`
    );
  }

  let tokens: CloudTokens;
  if (providerId === "dropbox") {
    // Dropbox: PKCE через попап, затем exchange
    const resultUrl = await dropboxProvider.startAuth(config);
    tokens = await provider.exchangeCodeForTokens(config, resultUrl);
  } else if (providerId === "google") {
    // Google: GIS token model (popup inside GIS)
    tokens = await provider.exchangeCodeForTokens(config, "");
  } else {
    // Яндекс: implicit token в фрагменте попапа
    const authUrl = provider.buildAuthUrl(config);
    const fragment = await openAuthPopup(authUrl);
    tokens = await provider.exchangeCodeForTokens(config, fragment);
  }

  await saveCloudTokens(tokens);
  const userInfo = await provider.getUserInfo(tokens);
  return { tokens, userInfo };
}

export async function disconnectProvider(providerId: CloudProviderId): Promise<void> {
  await deleteCloudTokens(providerId);
}

export async function getConnectedProviders(): Promise<
  Array<{ id: CloudProviderId; name: string; userInfo?: { name?: string; email?: string } }>
> {
  const ids = await listConnectedProviders();
  const result = [];
  for (const id of ids) {
    const tokens = await loadCloudTokens(id);
    if (tokens && isTokenValid(tokens)) {
      const provider = getProvider(id);
      const userInfo = await provider.getUserInfo(tokens).catch(() => ({}));
      result.push({ id, name: provider.name, userInfo });
    }
  }
  return result;
}

export interface ExportOptions {
  /** Экспортировать как PDF (human-readable) или как зашифрованный бэкап vault */
  format: "pdf" | "vault-backup";
  /** Имя файла (без расширения) */
  fileName: string;
  /** Путь в облаке (папка) */
  remotePath: string;
}

/** Экспорт документа в подключенное облако. */
export async function exportDocument(
  providerId: CloudProviderId,
  docPayload: { html?: string; pdfBlob?: Blob; vaultBlob?: Blob },
  opts: ExportOptions
): Promise<{ id: string; url?: string }> {
  const provider = getProvider(providerId);
  const tokens = await loadCloudTokens(providerId);
  if (!tokens) throw new Error(`Провайдер ${providerId} не подключен`);
  if (!isTokenValid(tokens)) throw new Error(`Токен ${providerId} истёк — переподключите`);

  let blob: Blob;
  let contentType: string;
  let ext: string;

  if (opts.format === "pdf") {
    blob = docPayload.pdfBlob || new Blob([docPayload.html || ""], { type: "text/html" });
    contentType = "application/pdf";
    ext = ".pdf";
  } else {
    blob = docPayload.vaultBlob || new Blob([JSON.stringify(docPayload)], { type: "application/json" });
    contentType = "application/json";
    ext = ".json";
  }

  const remotePath = `${opts.remotePath.replace(/\/$/, "")}/${opts.fileName}${ext}`;
  return provider.uploadFile(tokens, remotePath, blob, contentType);
}

/** Экспорт всех документов vault в облако (как зашифрованный бэкап). */
export async function exportAllVaultDocuments(
  providerId: CloudProviderId,
  docs: Array<{ meta: { id: string; title: string }; payload: any }>,
  remoteFolder: string = "/Dogovor.expert/vault-backup"
): Promise<{ success: number; failed: string[] }> {
  const provider = getProvider(providerId);
  const tokens = await loadCloudTokens(providerId);
  if (!tokens) throw new Error(`Провайдер ${providerId} не подключен`);
  if (!isTokenValid(tokens)) throw new Error(`Токен ${providerId} истёк`);

  const results = { success: 0, failed: [] as string[] };
  for (const doc of docs) {
    try {
      const blob = new Blob([JSON.stringify(doc.payload)], { type: "application/json" });
      await provider.uploadFile(
        tokens,
        `${remoteFolder}/${doc.meta.title.replace(/[/\\]/g, "_")}.json`,
        blob,
        "application/json"
      );
      results.success++;
    } catch (e) {
      results.failed.push(`${doc.meta.title}: ${(e as Error).message}`);
    }
  }
  return results;
}

// Реэкспорт для удобства
export { openAuthPopup, parseTokenFromFragment } from "./oauth";
export type { CloudTokens, CloudConfig } from "./types";