// Google Drive — Google Identity Services (GIS) token model.
// Чистый client-side: загружаем gsi клиент, initTokenClient, requestAccessToken.
// См. https://developers.google.com/identity/oauth2/web/reference/js-reference

import type { CloudProvider, CloudTokens, CloudConfig, CloudFolder } from "../types";

const GOOGLE_API = "https://www.googleapis.com";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";
const DEFAULT_SCOPES = ["https://www.googleapis.com/auth/drive.file"]; // per-file access

let gisLoaded = false;
let gisLoadPromise: Promise<void> | null = null;

function loadGIS(): Promise<void> {
  if (gisLoaded) return Promise.resolve();
  if (gisLoadPromise) return gisLoadPromise;
  gisLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Не удалось загрузить Google Identity Services"));
    document.head.appendChild(script);
  });
  return gisLoadPromise;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token: string; expires_in: number; error?: string }) => void;
          }) => {
            requestAccessToken: (opts: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export class GoogleDriveProvider implements CloudProvider {
  readonly id = "google" as const;
  readonly name = "Google Drive";
  readonly description = "Google Drive (США — учтите трансграничную передачу ПД)";

  getRedirectUri(): string {
    return typeof window !== "undefined"
      ? window.location.origin + "/connections"
      : "";
  }

  buildAuthUrl(_config: CloudConfig): string {
    // GIS использует не URL а callback; buildAuthUrl не нужен, но интерфейс требует.
    // Вернём пустую строку — OAuth запускается через connect() в manager.
    return "";
  }

  async exchangeCodeForTokens(
    config: CloudConfig,
    _codeOrFragment: string
  ): Promise<CloudTokens> {
    await loadGIS();
    const scopes = config.scopes.length ? config.scopes : DEFAULT_SCOPES;

    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error("Google Identity Services не загружен"));
        return;
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: config.clientId,
        scope: scopes.join(" "),
        callback: (resp) => {
          if (resp.error) {
            reject(new Error(`Google OAuth error: ${resp.error}`));
            return;
          }
          resolve({
            provider: "google",
            accessToken: resp.access_token,
            expiresAt: Date.now() + resp.expires_in * 1000,
            tokenType: "Bearer",
            scope: scopes.join(" "),
          });
        },
      });
      client.requestAccessToken({ prompt: "consent" });
    });
  }

  private async authedFetch(
    tokens: CloudTokens,
    url: string,
    init: RequestInit = {}
  ): Promise<Response> {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        ...init.headers,
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Google Drive API ${res.status}: ${txt || res.statusText}`);
    }
    return res;
  }

  async uploadFile(
    tokens: CloudTokens,
    path: string,
    blob: Blob,
    contentType?: string
  ): Promise<{ id: string; url?: string }> {
    // multipart upload — простой и надежный для файлов до 5MB (а наши PDF/JSON маленькие)
    const metadata = { name: path.split("/").pop() || "document", parents: [] };
    // Определяем папку Dogovor.expert (создадим если нет) — для простоты положим в корень
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", blob, metadata.name);

    const res = await this.authedFetch(tokens, `${DRIVE_UPLOAD}?uploadType=multipart`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    return { id: data.id, url: data.webViewLink };
  }

  async downloadFile(tokens: CloudTokens, path: string): Promise<Blob> {
    // Найти файл по имени (Google Drive требует fileId для download).
    // Для простоты: ищем файл по имени в корне/папке Dogovor.expert.
    const files = await this.searchFile(tokens, path.split("/").pop() || "document");
    if (!files.length) throw new Error("Файл не найден на Google Drive");
    const fileId = files[0].id;
    const res = await this.authedFetch(
      tokens,
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    );
    return res.blob();
  }

  async searchFile(tokens: CloudTokens, name: string): Promise<{ id: string; name: string }[]> {
    const q = encodeURIComponent(`name = '${name}' and trashed = false`);
    const res = await this.authedFetch(
      tokens,
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`
    );
    const data = await res.json();
    return data.files || [];
  }

  async listFiles(tokens: CloudTokens, folderPath: string = "/"): Promise<Array<{ name: string; path: string; size: number; modified: string }>> {
    // Google Drive не имеет иерархических путей как файловая система.
    // Ищем папку Dogovor.expert по имени, затем файлы внутри.
    const folderName = folderPath.split("/").pop() || "Dogovor.expert";
    const folders = await this.searchFile(tokens, folderName);
    let folderId = folders[0]?.id;
    if (!folderId) {
      // Папки нет - возвращаем пустой массив
      return [];
    }
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await this.authedFetch(
      tokens,
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,size,modifiedTime)`
    );
    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      name: f.name,
      path: f.id,
      size: parseInt(f.size || "0", 10),
      modified: f.modifiedTime,
    }));
  }

  async getUserInfo(tokens: CloudTokens): Promise<{ name?: string; email?: string }> {
    const res = await this.authedFetch(
      tokens,
      "https://www.googleapis.com/oauth2/v2/userinfo"
    );
    const data = await res.json();
    return { name: data.name, email: data.email };
  }

  /** Список папок (для folder picker) */
  async listFolders(tokens: CloudTokens, folderPath: string = "/"): Promise<CloudFolder[]> {
    const folderName = folderPath.split("/").pop() || "Dogovor.expert";
    const folders = await this.searchFile(tokens, folderName);
    let folderId = folders[0]?.id;
    if (!folderId) return [];

    const q = encodeURIComponent(
      `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    const res = await this.authedFetch(
      tokens,
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`
    );
    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      name: f.name,
      path: f.id,
      isFolder: true as const,
    }));
  }

  /** Создание папки (Google Drive API) */
  async createFolder(tokens: CloudTokens, name: string, parentPath: string): Promise<string> {
    // Находим parent folder ID
    const parentName = parentPath.split("/").pop() || "Dogovor.expert";
    const folders = await this.searchFile(tokens, parentName);
    const parentId = folders[0]?.id;

    const metadata = {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : [],
    };
    const res = await this.authedFetch(tokens, "https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
    });
    const data = await res.json();
    return data.id;
  }
}

export const googleDriveProvider = new GoogleDriveProvider();