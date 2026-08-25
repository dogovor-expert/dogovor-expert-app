// Dropbox — OAuth 2.0 PKCE (code flow).
// См. https://www.dropbox.com/developers/documentation/http/documentation#oauth2-authorize
// https://dropbox.tech/developers/pkce--what-and-why-

import type { CloudProvider, CloudTokens, CloudConfig } from "../types";
import { buildAuthUrl, createPKCE, openAuthPopup, parseCodeFromUrl } from "../oauth";

const DROPBOX_AUTH = "https://www.dropbox.com/oauth2/authorize";
const DROPBOX_TOKEN = "https://api.dropbox.com/oauth2/token";
const DROPBOX_API = "https://api.dropboxapi.com/2";
const CONTENT_API = "https://content.dropboxapi.com/2";
const DEFAULT_SCOPES = [
  "files.content.read",
  "files.content.write",
  "files.metadata.read",
  "files.metadata.write",
  "account_info.read",
];

export class DropboxProvider implements CloudProvider {
  readonly id = "dropbox" as const;
  readonly name = "Dropbox";
  readonly description = "Dropbox (США — учтите трансграничную передачу ПД)";

  getRedirectUri(): string {
    return typeof window !== "undefined"
      ? window.location.origin + "/connections"
      : "";
  }

  buildAuthUrl(config: CloudConfig): string {
    // PKCE: нам нужен code_challenge
    // Этот метод вызывается до connect, поэтому PKCE создаем здесь и сохраняем в sessionStorage
    const scopes = config.scopes.length ? config.scopes : DEFAULT_SCOPES;
    return ""; // фактический URL строится в connect() через createPKCE
  }

  async exchangeCodeForTokens(
    config: CloudConfig,
    codeOrUrl: string
  ): Promise<CloudTokens> {
    // codeOrUrl — это либо code (если мы уже извлекли), либо полный URL с ?code=
    const code = parseCodeFromUrl(codeOrUrl) || codeOrUrl;
    if (!code) throw new Error("Authorization code не найден");

    // code_verifier должен быть тем же, что при генерации challenge
    const verifier = sessionStorage.getItem("dbx_pkce_verifier");
    if (!verifier) throw new Error("PKCE verifier утерян (сессия сброшена)");

    const body = new URLSearchParams({
      code,
      grant_type: "authorization_code",
      code_verifier: verifier,
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
    });

    const res = await fetch(DROPBOX_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Dropbox token exchange ${res.status}: ${txt}`);
    }
    const data = await res.json();
    sessionStorage.removeItem("dbx_pkce_verifier");
    return {
      provider: "dropbox",
      accessToken: data.access_token,
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
      tokenType: data.token_type,
      scope: data.scope,
    };
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
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Dropbox API ${res.status}: ${txt || res.statusText}`);
    }
    return res;
  }

  /** Запускает OAuth PKCE через попап. Возвращает code (попап редиректит на redirect_uri с ?code=). */
  async startAuth(config: CloudConfig): Promise<string> {
    const pkce = await createPKCE();
    sessionStorage.setItem("dbx_pkce_verifier", pkce.codeVerifier);

    const scopes = config.scopes.length ? config.scopes : DEFAULT_SCOPES;
    const authUrl = buildAuthUrl(DROPBOX_AUTH, {
      client_id: config.clientId,
      response_type: "code",
      code_challenge: pkce.codeChallenge,
      code_challenge_method: "S256",
      redirect_uri: config.redirectUri,
      scope: scopes.join(" "),
      state: pkce.state,
    });

    const resultUrl = await openAuthPopup(authUrl);
    // resultUrl — это URL с ?code=... (попап закрылся после редиректа на наш origin)
    return resultUrl;
  }

  async uploadFile(
    tokens: CloudTokens,
    path: string,
    blob: Blob,
    contentType?: string
  ): Promise<{ id: string; url?: string }> {
    const apiArg = {
      path: path.startsWith("/") ? path : "/" + path,
      mode: "overwrite" as const,
      autorename: false,
      mute: false,
      strict_conflict: false,
    };
    const res = await fetch(`${CONTENT_API}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Dropbox-API-Arg": JSON.stringify(apiArg),
        "Content-Type": contentType || "application/octet-stream",
      },
      body: blob,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Dropbox upload ${res.status}: ${txt}`);
    }
    const data = await res.json();
    return { id: data.path_display || path, url: data.path_display };
  }

  async downloadFile(tokens: CloudTokens, path: string): Promise<Blob> {
    const apiArg = { path: path.startsWith("/") ? path : "/" + path };
    const res = await fetch(`${CONTENT_API}/files/download`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Dropbox-API-Arg": JSON.stringify(apiArg),
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Dropbox download ${res.status}: ${txt}`);
    }
    return res.blob();
  }

  async getUserInfo(tokens: CloudTokens): Promise<{ name?: string; email?: string }> {
    const res = await this.authedFetch(tokens, `${DROPBOX_API}/users/get_current_account`);
    const data = await res.json();
    return {
      name: data.name?.display_name,
      email: data.email,
    };
  }
}

export const dropboxProvider = new DropboxProvider();