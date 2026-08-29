// Яндекс.Диск — OAuth authorization code flow с offline scope для refresh_token + REST API.
// См. https://yandex.ru/dev/disk/api/concepts/quickstart.html
// https://yandex.ru/dev/oauth/doc/dg/reference/token.html

import type { CloudProvider, CloudTokens, CloudConfig, CloudFolder } from "../types";
import { buildAuthUrl, parseTokenFromFragment } from "../oauth";

const YANDEX_AUTH = "https://oauth.yandex.ru/authorize";
const YANDEX_TOKEN = "https://oauth.yandex.ru/token";
const YANDEX_API = "https://cloud-api.yandex.net/v1/disk";

const DEFAULT_SCOPES = ["cloud_api:disk.write", "cloud_api:disk.read", "cloud_api:disk.info"];
const OFFLINE_SCOPES = [...DEFAULT_SCOPES, "offline"]; // для refresh_token

export class YandexDiskProvider implements CloudProvider {
  readonly id = "yandex" as const;
  readonly name = "Яндекс.Диск";
  readonly description = "Хранение файлов на Яндекс.Диске (Россия, 152-ФЗ-совместимо)";

  getRedirectUri(): string {
    return typeof window !== "undefined"
      ? window.location.origin + "/connections"
      : "";
  }

  buildAuthUrl(config: CloudConfig): string {
    // Используем authorization code flow с offline scope для получения refresh_token
    const scopes = config.scopes.length ? config.scopes : OFFLINE_SCOPES;
    return buildAuthUrl(YANDEX_AUTH, {
      response_type: "code",
      client_id: config.clientId,
      scope: scopes.join(" "),
      redirect_uri: config.redirectUri,
    });
  }

  async exchangeCodeForTokens(
    config: CloudConfig,
    codeOrFragment: string
  ): Promise<CloudTokens> {
    // Поддерживаем оба варианта: code (новый flow) или fragment (старый implicit)
    const code = codeOrFragment.includes("code=")
      ? new URLSearchParams(codeOrFragment.replace(/^\?/, "")).get("code")
      : null;
    
    if (code) {
      // Authorization code flow — обмен кода на токены
      const body = new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
      });

      const res = await fetch(YANDEX_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Yandex token exchange ${res.status}: ${txt}`);
      }
      const data = await res.json();
      return {
        provider: "yandex",
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
        tokenType: data.token_type,
        scope: data.scope,
      };
    }

    // Fallback: старый implicit flow (fragment с access_token)
    const parsed = parseTokenFromFragment(codeOrFragment);
    if (!parsed) throw new Error("Токен не найден в фрагменте URL");
    return {
      provider: "yandex",
      accessToken: parsed.accessToken,
      expiresAt: parsed.expiresIn
        ? Date.now() + parsed.expiresIn * 1000
        : undefined,
      tokenType: parsed.tokenType,
      scope: DEFAULT_SCOPES.join(" "),
    };
  }

  /** Обновление access_token через refresh_token (offline access). */
  async refreshTokens(tokens: CloudTokens): Promise<CloudTokens> {
    if (!tokens.refreshToken) throw new Error("Нет refresh_token — нужен повторный вход");
    
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
      client_id: (await import("../manager")).getClientId("yandex") || "",
    });

    const res = await fetch(YANDEX_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Yandex token refresh ${res.status}: ${txt}`);
    }
    const data = await res.json();
    return {
      provider: "yandex",
      accessToken: data.access_token,
      refreshToken: data.refresh_token || tokens.refreshToken,
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  private async request<T>(
    tokens: CloudTokens,
    path: string,
    init: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${YANDEX_API}${path}`, {
      ...init,
      headers: {
        Authorization: `OAuth ${tokens.accessToken}`,
        Accept: "application/json",
        ...init.headers,
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Yandex Disk API ${res.status}: ${txt || res.statusText}`);
    }
    return res.json();
  }

  async uploadFile(
    tokens: CloudTokens,
    path: string,
    blob: Blob,
    contentType?: string
  ): Promise<{ id: string; url?: string }> {
    // 1) Получаем upload URL
    const uploadResp = await this.request<{ href: string; method: string }>(
      tokens,
      `/resources/upload?path=${encodeURIComponent(path)}&overwrite=true`
    );
    // 2) PUT файл на href
    const putRes = await fetch(uploadResp.href, {
      method: uploadResp.method || "PUT",
      headers: contentType ? { "Content-Type": contentType } : {},
      body: blob,
    });
    if (!putRes.ok) {
      const txt = await putRes.text().catch(() => "");
      throw new Error(`Upload failed ${putRes.status}: ${txt}`);
    }
    // Yandex возвращает метаданную ресурса
    const meta = await putRes.json().catch(() => ({}));
    return { id: meta.path || path, url: meta.file || meta.public_url };
  }

  async downloadFile(tokens: CloudTokens, path: string): Promise<Blob> {
    const dl = await this.request<{ href: string }>(
      tokens,
      `/resources/download?path=${encodeURIComponent(path)}`
    );
    const res = await fetch(dl.href);
    if (!res.ok) throw new Error(`Download failed ${res.status}`);
    return res.blob();
  }

  async getUserInfo(tokens: CloudTokens): Promise<{ name?: string; email?: string }> {
    const info = await this.request<{ user?: { display_name?: string; login?: string } }>(
      tokens,
      "/"
    );
    return {
      name: info.user?.display_name,
      email: info.user?.login,
    };
  }

  // Удобный метод: получить список файлов в папке
  async listFiles(tokens: CloudTokens, path: string = "/"): Promise<any[]> {
    const resp = await this.request<{ _embedded?: { items: any[] } }>(
      tokens,
      `/resources?path=${encodeURIComponent(path)}&limit=100`
    );
    return resp._embedded?.items || [];
  }

  /** Список папок (для folder picker) */
  async listFolders(tokens: CloudTokens, path: string = "/"): Promise<CloudFolder[]> {
    const items = await this.listFiles(tokens, path);
    return items
      .filter((item: any) => item.type === "dir")
      .map((item: any) => ({
        name: item.name,
        path: item.path,
        isFolder: true as const,
      }));
  }

  /** Создание папки (Yandex Disk API) */
  async createFolder(tokens: CloudTokens, path: string): Promise<void> {
    await this.request(
      tokens,
      `/resources?path=${encodeURIComponent(path)}`,
      { method: "PUT" }
    );
  }
}

export const yandexDiskProvider = new YandexDiskProvider();